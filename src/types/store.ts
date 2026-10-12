export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured?: boolean;
  tags?: string[];
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  emailStatus: 'sent' | 'simulated' | 'failed' | 'pending';
  emailMessageId?: string;
  emailPreviewHtml?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  savedAddress?: ShippingAddress;
  updatedAt?: string;
}
