import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Mail,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CartItem, ShippingAddress, Order } from '../types/store';
import { useAuth } from '../context/AuthContext';
import { createOrder, BrevoSettings } from '../services/storeService';

interface CheckoutPageProps {
  items: CartItem[];
  promoCode: string;
  discountRate: number;
  onReturnToShop: () => void;
  onClearCart: () => void;
  onViewOrders: () => void;
  brevoSettings: BrevoSettings;
  onOpenBrevoSettings: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  promoCode,
  discountRate,
  onReturnToShop,
  onClearCart,
  onViewOrders,
  brevoSettings,
  onOpenBrevoSettings,
}) => {
  const { currentUser, userProfile, signInWithGoogle } = useAuth();

  // Steps: 'details' -> 'shipping' -> 'payment' -> 'confirmation'
  const [currentStep, setCurrentStep] = useState<'details' | 'shipping' | 'payment' | 'confirmation'>('details');

  // Form states
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: currentUser?.displayName || userProfile?.displayName || '',
    email: currentUser?.email || userProfile?.email || '',
    phone: '',
    address: userProfile?.savedAddress?.address || '104 Mercer St, Apt 4B',
    apartment: userProfile?.savedAddress?.apartment || '',
    city: userProfile?.savedAddress?.city || 'New York',
    country: userProfile?.savedAddress?.country || 'United States',
    postalCode: userProfile?.savedAddress?.postalCode || '10012',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'priority'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'googlepay'>('card');

  // Credit Card inputs (simulation)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * discountRate;

  let shippingCost = 0;
  if (shippingMethod === 'standard') {
    shippingCost = subtotal >= 150 ? 0 : 9.0;
  } else if (shippingMethod === 'express') {
    shippingCost = 16.0;
  } else if (shippingMethod === 'priority') {
    shippingCost = 28.0;
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Autofill with Google account
  const handleAutofillGoogle = () => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.displayName || prev.fullName,
        email: currentUser.email || prev.email,
      }));
    } else {
      signInWithGoogle();
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.address) {
      alert('Please fill in your contact and shipping information.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: currentUser ? currentUser.uid : 'guest',
        customerName: formData.fullName,
        customerEmail: formData.email,
        shippingAddress: formData,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
        })),
        subtotal,
        shippingFee: shippingCost,
        discount: discountAmount,
        total: grandTotal,
        paymentMethod: paymentMethod === 'googlepay' ? 'Google Pay (Cloud Console)' : 'Credit Card (Simulated)',
      };

      const result = await createOrder(orderPayload, brevoSettings);
      setCompletedOrder(result);
      setCurrentStep('confirmation');
      onClearCart();

      // Fire celebratory confetti blast
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If in confirmation view
  if (currentStep === 'confirmation' && completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-zinc-100">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800/60">
              Order Confirmed & Persisted in Database
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Thank you for your order!
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              We've processed order <strong className="text-amber-400 font-mono">#{completedOrder.id.slice(-8).toUpperCase()}</strong> and dispatched your official receipt.
            </p>
          </div>

          {/* Brevo Confirmation Status Card */}
          <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs text-white">Brevo Email Confirmation</span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  completedOrder.emailStatus === 'sent'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-900/50 text-amber-300 border border-amber-700/60'
                }`}
              >
                {completedOrder.emailStatus === 'sent' ? 'Sent via Brevo API' : 'Simulated & Generated'}
              </span>
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>Recipient:</span>
                <span className="text-zinc-200 font-medium">{completedOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Brevo Message ID:</span>
                <span className="text-zinc-400 font-mono text-[11px] truncate max-w-xs">
                  {completedOrder.emailMessageId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Database Sync:</span>
                <span className="text-emerald-400 font-medium">Cloud Firestore /orders/{completedOrder.id}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setReceiptModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Brevo HTML Receipt
              </button>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="max-w-xl mx-auto bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-5 text-left text-xs space-y-3">
            <h3 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
              Purchased Items
            </h3>
            <div className="divide-y divide-zinc-900">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-900"
                    />
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-zinc-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-semibold text-zinc-200">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${completedOrder.subtotal.toFixed(2)}</span>
              </div>
              {completedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${completedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{completedOrder.shippingFee === 0 ? 'FREE' : `$${completedOrder.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Paid</span>
                <span className="text-amber-400">${completedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onReturnToShop}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Continue Shopping
            </button>
            <button
              onClick={onViewOrders}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-2xl text-sm transition-colors border border-zinc-700"
            >
              View Orders History
            </button>
          </div>
        </div>

        {/* Receipt HTML Preview Modal */}
        {receiptModalOpen && completedOrder.emailPreviewHtml && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Brevo HTML Email Receipt Preview</span>
                </div>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 text-zinc-900">
                <iframe
                  title="Receipt Preview"
                  srcDoc={completedOrder.emailPreviewHtml}
                  className="w-full h-[550px] border-0 rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-zinc-100">
      {/* Return button */}
      <button
        onClick={onReturnToShop}
        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between text-xs font-medium">
            <div className={`flex items-center gap-2 ${currentStep === 'details' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              <span>Information</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-700" />
            <div className={`flex items-center gap-2 ${currentStep === 'shipping' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              <span>Shipping</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-700" />
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              <span>Payment</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Step 1: Customer & Shipping Details */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">1</span>
                  Contact & Shipping Address
                </h2>

                {/* Google Auth Autofill button */}
                <button
                  type="button"
                  onClick={handleAutofillGoogle}
                  className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{currentUser ? 'Autofilled with Google' : 'Autofill with Google'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="Mustapha Ajibade"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Email (for Mailgun receipt) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="ajibademusty@gmail.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-medium">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="104 Mercer Street"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Apartment, suite, unit (optional)</label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="Apt 4B"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Postal / Zip Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="10012"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                Shipping Delivery Method
              </h2>

              <div className="space-y-2.5 text-xs">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'bg-amber-950/20 border-amber-500/80 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-zinc-100">Standard Insured Courier (3-5 business days)</div>
                      <div className="text-[11px] text-zinc-500">Tracked delivery with carbon neutral offset</div>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-100">
                    {subtotal >= 150 ? <span className="text-emerald-400">FREE</span> : '$9.00'}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'bg-amber-950/20 border-amber-500/80 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-zinc-100">Express Priority Air (1-2 business days)</div>
                      <div className="text-[11px] text-zinc-500">Dedicated express courier with live tracking</div>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-100">$16.00</span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'priority'
                      ? 'bg-amber-950/20 border-amber-500/80 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'priority'}
                      onChange={() => setShippingMethod('priority')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-zinc-100">White Glove Same-Day / Next-Morning</div>
                      <div className="text-[11px] text-zinc-500">Guaranteed early delivery with signature on delivery</div>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-100">$28.00</span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</span>
                Secure Payment
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('googlepay')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                    paymentMethod === 'googlepay'
                      ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Pay</span>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-medium">Expiration</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-medium">CVC / Security Code</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 text-center space-y-2">
                  <div className="text-xs text-zinc-300">
                    Ready to authenticate with Google Cloud Console credentials.
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Biometric & 1-Click Secure Authorization Active
                  </div>
                </div>
              )}

              {/* Brevo integration indicator */}
              <div className="bg-zinc-950/80 rounded-2xl p-3.5 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-zinc-200 font-medium">Brevo Confirmation Dispatch</span>
                    <p className="text-[11px] text-zinc-500">
                      {brevoSettings.apiKey ? 'Configured with custom Brevo API Key' : 'Simulation & live preview mode enabled'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenBrevoSettings}
                  className="text-amber-400 hover:underline text-[11px] font-semibold"
                >
                  Configure
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black rounded-2xl text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Persisting Order & Dispatching Brevo Receipt...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${grandTotal.toFixed(2)} & Complete Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h3 className="font-bold text-base text-white border-b border-zinc-800 pb-3">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-zinc-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-200 truncate">{item.product.name}</h4>
                    <p className="text-zinc-500 text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-zinc-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price lines */}
            <div className="space-y-2 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promo Code ({promoCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod})</span>
                <span className="text-zinc-200 font-medium">
                  {shippingCost === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-zinc-800">
                <span>Total Due</span>
                <span className="text-amber-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cloud Firestore Database Persistence with Row-level Isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Automatic confirmation receipt via Brevo Transactional API</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Google Cloud Console OAuth 2.0 Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
