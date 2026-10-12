import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  Mail,
  ShieldCheck,
  Filter,
  Check,
  Package,
} from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { BrevoModal } from './components/BrevoModal';
import { OrdersModal } from './components/OrdersModal';
import { Product, CartItem } from './types/store';
import { fetchProducts, BrevoSettings } from './services/storeService';

const CATEGORIES = [
  'All',
  'Coffee & Kitchen',
  'Audio & Tech',
  'Desk & Work',
  'Living & Decor',
];

export default function App() {
  return (
    <AuthProvider>
      <StoreFront />
    </AuthProvider>
  );
}

function StoreFront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutView, setIsCheckoutView] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isBrevoModalOpen, setIsBrevoModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search, category & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Brevo settings
  const [brevoSettings, setBrevoSettings] = useState<BrevoSettings>(() => {
    try {
      const saved = localStorage.getItem('aura_brevo_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [brevoServerConfigured, setBrevoServerConfigured] = useState<boolean | null>(null);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Cart localStorage error:', e);
    }
  }, [cart]);

  // Load products & check Brevo configuration on mount
  useEffect(() => {
    fetchProducts()
      .then((items) => setProducts(items))
      .finally(() => setLoading(false));

    fetch('/api/brevo-status')
      .then((r) => r.json())
      .then((data) => setBrevoServerConfigured(Boolean(data.configured)))
      .catch(() => setBrevoServerConfigured(false));
  }, []);

  const handleSaveBrevoSettings = (newSettings: BrevoSettings) => {
    setBrevoSettings(newSettings);
    setBrevoServerConfigured(true);
    try {
      localStorage.setItem('aura_brevo_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1500);
    showToast(`Added ${quantity} × ${product.name} to cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filter & sort products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenBrevoSettings={() => setIsBrevoModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={CATEGORIES}
      />

      {/* Main Content Area */}
      {isCheckoutView ? (
        <main className="flex-1">
          <CheckoutPage
            items={cart}
            promoCode={promoCode}
            discountRate={discountRate}
            onReturnToShop={() => setIsCheckoutView(false)}
            onClearCart={handleClearCart}
            onViewOrders={() => {
              setIsCheckoutView(false);
              setIsOrdersOpen(true);
            }}
            brevoSettings={brevoSettings}
            onOpenBrevoSettings={() => setIsBrevoModalOpen(true)}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
          {/* Instructor Live Email Dispatch Status Banner */}
          {brevoServerConfigured === false ? (
            <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-white text-sm block">Instructors Real Email Delivery Setup</strong>
                  <p className="text-amber-200/80 leading-relaxed">
                    To make sure instructors receive real confirmation emails in their actual inboxes when testing checkout, connect your Brevo API key and verified sender email once.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBrevoModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold whitespace-nowrap self-start sm:self-center transition-all shadow-md shadow-amber-500/20"
              >
                Connect Brevo API
              </button>
            </div>
          ) : brevoServerConfigured === true ? (
            <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  <strong>Live Brevo Dispatch Active:</strong> When instructors or shoppers check out, real confirmation emails are dispatched automatically to their inbox.
                </span>
              </div>
              <button
                onClick={() => setIsBrevoModalOpen(true)}
                className="text-emerald-400 hover:underline font-semibold text-[11px]"
              >
                Settings
              </button>
            </div>
          ) : null}

          {/* Hero Banner */}
          <section className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 sm:p-12 lg:p-16 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Autonomous AI Engineering Showcase</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Curated Design Goods & Precision Living.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Experience an artisan shopping experience backed by persistent database storage, Brevo transactional confirmation emails, and verified Google Cloud authentication.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsBrevoModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Brevo Email Setup & Logs</span>
                </button>
              </div>
            </div>

            {/* Architecture Capability Pillars */}
            <div className="mt-10 pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="flex items-start gap-3 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/60">
                <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Persistent Database</strong>
                  <span>Cloud Firestore records catalog, carts, and customer purchase history.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/60">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Brevo Confirmation</strong>
                  <span>Automated dispatch with HTML receipt template & Brevo API v3.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/60">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Google Cloud Auth</strong>
                  <span>Seamless OAuth 2.0 authentication via Google Cloud Console credentials.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Catalog Section */}
          <section id="catalog" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {selectedCategory === 'All' ? 'Full Catalog' : selectedCategory}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Showing {sortedProducts.length} handcrafted products available for immediate dispatch
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 space-y-3">
                <p className="text-base text-zinc-400 font-semibold">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    isAdded={recentlyAddedId === product.id}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutView(true)}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        discountRate={discountRate}
        setDiscountRate={setDiscountRate}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
      />

      {/* Orders Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Brevo Modal */}
      <BrevoModal
        isOpen={isBrevoModalOpen}
        onClose={() => setIsBrevoModalOpen(false)}
        settings={brevoSettings}
        onSaveSettings={handleSaveBrevoSettings}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-bold text-white text-sm tracking-wide">
              AURA COMMERCE ENGINE
            </div>
            <p className="text-zinc-500">
              Modern Shop Architecture with Cloud Firestore persistence, Brevo confirmation emails, and Google Cloud OAuth.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-500">
            <button
              onClick={() => setIsBrevoModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Brevo Service
            </button>
            <button
              onClick={() => setIsOrdersOpen(true)}
              className="hover:text-white transition-colors"
            >
              Order Database Records
            </button>
            <span>Google Cloud Console Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
