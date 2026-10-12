import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
  isAdded,
}) => {
  return (
    <div className="group relative bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full overflow-hidden bg-zinc-950 cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-zinc-950/80 backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full text-zinc-300 border border-zinc-800">
            {product.category}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-amber-500/90 text-zinc-950 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full shadow-sm">
              Save ${(product.originalPrice - product.price).toFixed(0)}
            </span>
          )}
        </div>

        {/* Stock warning if low */}
        {product.stock <= 8 && (
          <div className="absolute bottom-3 left-3 bg-red-950/90 border border-red-800/80 backdrop-blur-sm text-[10px] font-medium text-red-200 px-2 py-0.5 rounded-full">
            Only {product.stock} left in stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div
          onClick={() => onSelectProduct(product)}
          className="cursor-pointer space-y-1.5"
        >
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-semibold text-zinc-200">{product.rating.toFixed(1)}</span>
            <span className="text-zinc-500">({product.reviewCount})</span>
          </div>

          <h3 className="font-semibold text-zinc-100 text-base group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.subtitle || product.description}
          </p>
        </div>

        {/* Footer with Price and Quick Add */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
