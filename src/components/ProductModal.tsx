import React, { useState } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types/store';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const currentImg = selectedImg || product.imageUrl;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-zinc-100 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-950/70 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery / Image Side */}
        <div className="md:w-1/2 p-6 flex flex-col gap-4 bg-zinc-950/50">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img
              src={currentImg}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                    currentImg === img ? 'border-amber-400' : 'border-zinc-850 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Free Shipping &gt; $150</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>

        {/* Info Side */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{product.name}</h2>
              <p className="text-xs text-zinc-400 mt-1">{product.subtitle}</p>
            </div>

            {/* Rating & Stock */}
            <div className="flex items-center justify-between text-xs py-2 border-y border-zinc-800">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
                <span className="text-zinc-500">({product.reviewCount} verified reviews)</span>
              </div>
              <span className="text-zinc-400 font-medium">
                {product.stock > 0 ? (
                  <span className="text-emerald-400 font-semibold">In Stock ({product.stock})</span>
                ) : (
                  <span className="text-red-400">Sold Out</span>
                )}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-zinc-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-300 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specs && (
              <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 space-y-1.5 text-xs">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Specifications
                </span>
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-zinc-900 last:border-none text-[11px]">
                    <span className="text-zinc-500">{key}</span>
                    <span className="text-zinc-300 font-medium">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-700 rounded-xl bg-zinc-950 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add ${(product.price * quantity).toFixed(2)} to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
