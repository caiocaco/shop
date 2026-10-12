import React, { useState } from 'react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ExternalLink, Flame, Sparkles, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categoryName }) => {
  const { settings, navigate, trackAndRedirect } = useStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const discountPercent =
    product.previous_price && product.price && product.previous_price > product.price
      ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
      : null;

  const handleCardClick = (e: React.MouseEvent) => {
    // If not clicked on the buy button, go to single product view
    navigate(`/produto/${product.slug}`);
  };

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRedirecting(true);
    await trackAndRedirect(product.id, 'product_card_button');
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const primaryImg = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white border border-slate-200/90 ${settings.card_radius || 'rounded-2xl'} overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col`}
    >
      {/* Top Badges overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-wrap gap-1">
          {discountPercent !== null && (
            <span className="bg-rose-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-xs tracking-tight">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Destaque
            </span>
          )}
        </div>

        {product.clicks_count > 50 && (
          <span className="bg-slate-900/80 backdrop-blur-xs text-orange-400 font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 fill-orange-400" />
            <span>{product.clicks_count}</span>
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {categoryName}
            </span>
          )}

          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Buy Button Section */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="mb-3">
            {product.price ? (
              <div>
                {product.previous_price && product.previous_price > product.price && (
                  <span className="text-xs text-slate-400 line-through mr-1.5 font-medium">
                    {formatCurrency(product.previous_price)}
                  </span>
                )}
                <div className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(product.price)}
                </div>
              </div>
            ) : (
              <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block">
                Confira o preço no TikTok Shop
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleBuyClick}
            disabled={isRedirecting}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-xs transition-all hover:brightness-105 active:scale-98 cursor-pointer disabled:opacity-75"
            style={{ backgroundColor: settings.button_color || '#7c3aed' }}
          >
            {isRedirecting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Abrindo TikTok Shop...
              </span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver no TikTok Shop</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
