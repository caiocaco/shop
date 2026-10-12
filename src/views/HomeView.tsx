import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types.ts';
import { BannerHero } from '../components/BannerHero.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { ArrowRight, Flame, Star, Sparkles, TrendingUp, Layers, ChevronRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { settings, categories, navigate } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [mostClickedProducts, setMostClickedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [featuredRes, mostClickedRes, recentRes] = await Promise.all([
          fetch('/api/public/products?featured=true&limit=8'),
          fetch('/api/public/products?sort=popularity&limit=8'),
          fetch('/api/public/products?sort=newest&limit=8')
        ]);

        if (featuredRes.ok) {
          const d = await featuredRes.json();
          setFeaturedProducts(d.products || []);
        }
        if (mostClickedRes.ok) {
          const d = await mostClickedRes.json();
          setMostClickedProducts(d.products || []);
        }
        if (recentRes.ok) {
          const d = await recentRes.json();
          setRecentProducts(d.products || []);
        }
      } catch (err) {
        console.error('Error loading home products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || '';
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <BannerHero />

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Navegue por Categoria</h2>
          </div>
          <button
            onClick={() => navigate('/catalogo')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/catalogo?category=${encodeURIComponent(cat.slug)}`)}
              className="group relative bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-purple-300 transition-all overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full bg-purple-50 overflow-hidden mb-2.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Empty State when no products are registered yet */}
      {!loading && featuredProducts.length === 0 && mostClickedProducts.length === 0 && recentProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Sua vitrine está pronta para novos achadinhos!</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Nenhum produto cadastrado no momento. Cadastre produtos com seus links de afiliado do TikTok Shop no painel administrativo para exibi-los aqui.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md cursor-pointer"
              >
                Cadastrar Primeiro Produto no Painel
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Section 1: Most Clicked / Trending */}
      {settings.most_clicked_section_enabled && mostClickedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <Flame className="w-5 h-5 fill-orange-500" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.most_clicked_section_title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Os itens que mais geraram interesse e cliques dos nossos visitantes
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogo?sort=popularity')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>Ver ranking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {mostClickedProducts.slice(0, settings.items_per_section || 8).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                categoryName={getCategoryName(prod.category_id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Featured Products */}
      {settings.featured_section_enabled && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                  <Star className="w-5 h-5 fill-amber-500" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.featured_section_title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Produtos selecionados a dedo por nossa equipe com os melhores descontos
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogo?featured=true')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, settings.items_per_section || 8).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                categoryName={getCategoryName(prod.category_id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Recent Products */}
      {settings.recent_section_enabled && recentProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.recent_section_title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Últimos achadinhos adicionados à nossa vitrine
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogo?sort=newest')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span>Ver novidades</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {recentProducts.slice(0, settings.items_per_section || 8).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                categoryName={getCategoryName(prod.category_id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Big Callout Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/10 text-purple-200 text-xs font-bold rounded-full">
              Economize nas suas compras
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Procurando algum produto específico do TikTok?
            </h3>
            <p className="text-sm text-slate-300">
              Navegue pelo nosso catálogo completo com centenas de itens organizados com links diretos para vendedores oficiais.
            </p>
          </div>
          <button
            onClick={() => navigate('/catalogo')}
            className="px-8 py-4 rounded-xl font-black text-sm text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            Ver Todo o Catálogo
          </button>
        </div>
      </section>
    </div>
  );
};
