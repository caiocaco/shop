import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Category } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import {
  ExternalLink,
  ShieldCheck,
  Share2,
  Check,
  Copy,
  MessageCircle,
  ShoppingBag,
  Flame,
  Star,
  ChevronRight,
  ArrowLeft,
  Truck,
  RotateCcw
} from 'lucide-react';

interface ProductDetailProps {
  slug: string;
}

export const ProductDetailView: React.FC<ProductDetailProps> = ({ slug }) => {
  const { settings, navigate, trackAndRedirect, showToast } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/products/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setCategory(data.category);
          setRelated(data.related || []);
          if (data.product?.images?.length) {
            setSelectedImage(data.product.images[0]);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleBuyClick = async () => {
    if (!product) return;
    setIsRedirecting(true);
    await trackAndRedirect(product.id, 'product_detail_main_button');
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Link do produto copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const text = encodeURIComponent(`Olha esse achadinho que encontrei no ${settings.store_name}: ${product.name}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Carregando produto...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Produto não encontrado</h2>
        <p className="text-sm text-slate-500">
          O produto que você procura pode ter sido removido ou está temporariamente indisponível.
        </p>
        <button
          onClick={() => navigate('/catalogo')}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors"
        >
          Voltar para o Catálogo
        </button>
      </div>
    );
  }

  const discountPercent =
    product.previous_price && product.price && product.previous_price > product.price
      ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-purple-600 transition-colors cursor-pointer">
          Início
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => navigate('/catalogo')} className="hover:text-purple-600 transition-colors cursor-pointer">
          Catálogo
        </button>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => navigate(`/catalogo?category=${encodeURIComponent(category.slug)}`)}
              className="hover:text-purple-600 transition-colors cursor-pointer"
            >
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner">
            <img
              src={selectedImage || product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {discountPercent !== null && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} - imagem ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Clicks badge */}
            <div className="flex items-center justify-between">
              {category && (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                  {category.name}
                </span>
              )}
              {product.clicks_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{product.clicks_count} pessoas conferiram</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars Mock */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.9</span>
              <span>(Avaliações verificadas no TikTok Shop)</span>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              {product.price ? (
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Preço Promocional:</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {formatCurrency(product.price)}
                    </span>
                    {product.previous_price && product.previous_price > product.price && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        De: {formatCurrency(product.previous_price)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-700">
                  Preço dinâmico sujeito a cupons do vendedor no TikTok Shop.
                </div>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Frete grátis e cupons podem estar disponíveis no aplicativo do TikTok.</span>
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sobre este produto</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Call-to-action Button Box */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleBuyClick}
              disabled={isRedirecting}
              className="w-full py-4 px-6 rounded-2xl font-black text-base text-white flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-75"
              style={{ backgroundColor: settings.button_color || '#7c3aed' }}
            >
              {isRedirecting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Redirecionando com Segurança...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Comprar no TikTok Shop</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </>
              )}
            </button>

            {/* Share and Copy buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Mandatory Affiliate Disclosure Box */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-950">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Compra Direta e Segura no TikTok Shop</span>
              </div>
              <p className="text-[11px] leading-relaxed text-purple-800">
                Ao clicar no botão de compra, você será redirecionado para a página oficial do produto no TikTok Shop.
                A transação, pagamento e entrega são realizados integralmente pela plataforma do TikTok. Como participante do programa de afiliados, podemos receber uma comissão caso uma compra qualificada seja concluída, sem custo adicional para você.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="pt-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Produtos Relacionados</h2>
            <p className="text-xs text-slate-500">Mais achadinhos da mesma categoria para você conferir</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                categoryName={category?.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
