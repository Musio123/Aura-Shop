import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { Product, Order } from '../types/store';

export async function fetchProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) {
      // Seed default catalog to Firestore so user has live persistent data
      console.log('Seeding initial products into Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        try {
          await setDoc(doc(db, 'products', prod.id), prod);
        } catch (seedErr) {
          console.warn('Could not seed product to Firestore:', prod.id, seedErr);
        }
      }
      return INITIAL_PRODUCTS;
    }

    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (err) {
    console.warn('Error reading products from Firestore, falling back to local dataset:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Product;
    }
  } catch (err) {
    console.warn('Error fetching single product:', err);
  }
  return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
}

export interface BrevoSettings {
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'emailStatus'>,
  brevoSettings?: BrevoSettings
): Promise<Order> {
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  const order: Order = {
    ...orderData,
    id: orderId,
    createdAt,
    status: 'confirmed',
    emailStatus: 'pending',
  };

  // 1. Persist in Firestore database under /orders/{orderId}
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, order);
  } catch (dbErr) {
    console.error('Failed to persist order to Firestore:', dbErr);
  }

  // 2. Dispatch Confirmation Email via Brevo API endpoint
  try {
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: order.items,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount,
          total: order.total,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        },
        customApiKey: brevoSettings?.apiKey,
        customSenderEmail: brevoSettings?.senderEmail,
        customSenderName: brevoSettings?.senderName,
      }),
    });

    const emailResult = await response.json();
    if (emailResult.success) {
      order.emailStatus = emailResult.mode === 'live' ? 'sent' : 'simulated';
      order.emailMessageId = emailResult.messageId;
      order.emailPreviewHtml = emailResult.htmlPreview;

      // Update Firestore with email status
      try {
        await setDoc(
          doc(db, 'orders', orderId),
          {
            emailStatus: order.emailStatus,
            emailMessageId: order.emailMessageId,
            emailPreviewHtml: order.emailPreviewHtml,
            emailProvider: 'brevo',
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not update order email status in Firestore:', err);
      }
    } else {
      order.emailStatus = 'failed';
      order.emailPreviewHtml = emailResult.htmlPreview;
    }
  } catch (emailErr) {
    console.error('Could not contact email service:', emailErr);
    order.emailStatus = 'failed';
  }

  // Also save in local storage as a quick device backup
  try {
    const stored = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    localStorage.setItem('aura_orders', JSON.stringify([order, ...stored]));
  } catch (storageErr) {
    console.warn('Local storage write skipped:', storageErr);
  }

  return order;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    if (userId && userId !== 'guest') {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });

      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (orders.length > 0) return orders;
    }
  } catch (err) {
    console.warn('Could not query orders from Firestore:', err);
  }

  // Fallback to local storage for guests or offline sessions
  try {
    const stored = JSON.parse(localStorage.getItem('aura_orders') || '[]');
    if (userId && userId !== 'guest') {
      return stored.filter((o: Order) => o.userId === userId || o.userId === 'guest');
    }
    return stored;
  } catch {
    return [];
  }
}
