import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  Mail,
  Package,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenBrevoSettings: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenBrevoSettings,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  const { currentUser, userProfile, signInWithGoogle, signOutUser, loading } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
      setUserDropdownOpen(false);
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      setAuthError('Sign in with Google cancelled or blocked. Please ensure popups are allowed.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100 transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 via-zinc-900 to-amber-900/60 text-xs py-1.5 px-4 text-center text-amber-200/90 border-b border-zinc-800/80 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Complimentary Express Shipping on orders over $150 • Use code <strong className="text-white font-mono bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/60">AURAVIP10</strong> for 10% off</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="group flex items-center gap-2.5 text-left text-zinc-100 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                A
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  AURA
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-zinc-400 ml-1.5 font-medium border-l border-zinc-700 pl-1.5">
                  LIVING & GEAR
                </span>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search artisanal ceramics, hi-fi, lighting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Brevo settings / tester trigger */}
            <button
              onClick={onOpenBrevoSettings}
              title="Brevo Email Integration & Logs"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Brevo Setup</span>
            </button>

            {/* My Orders Button */}
            <button
              onClick={onOpenOrders}
              title="View Orders History"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline">Orders</span>
            </button>

            {/* Google Authentication */}
            <div className="relative">
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
              ) : currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {currentUser.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-200 hidden sm:inline-block max-w-[100px] truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-zinc-800">
                        <p className="font-semibold text-white truncate">
                          {currentUser.displayName || 'Google User'}
                        </p>
                        <p className="text-zinc-400 truncate text-[11px]">
                          {currentUser.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          Google Auth Verified
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 text-zinc-300 hover:text-white"
                      >
                        <Package className="w-3.5 h-3.5" />
                        My Orders History
                      </button>
                      <button
                        onClick={() => {
                          signOutUser();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium transition-all shadow-sm hover:border-amber-500/50"
                  title="Sign in with Google Cloud Console Auth"
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
                  <span className="hidden sm:inline">Google Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}
            </div>

            {/* Cart trigger button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center justify-center transition-all hover:scale-105 shadow-md shadow-amber-500/20"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-sm animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Auth error notification */}
        {authError && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs px-4 py-2 rounded-lg mb-2 flex items-center justify-between">
            <span>{authError}</span>
            <button onClick={() => setAuthError(null)} className="font-bold underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-zinc-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
