import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Search, Filter, SlidersHorizontal, X, Flame, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { categories, currentPath, navigate } = useStore();

  // Parse query params from URL
  const queryParams = new URLSearchParams(window.location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || '';
  const initialSort = queryParams.get('sort') || 'newest';
  const initialFeatured = queryParams.get('featured') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [onlyFeatured, setOnlyFeatured] = useState(initialFeatured);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSortBy(params.get('sort') || 'newest');
    setOnlyFeatured(params.get('featured') === 'true');
    setPage(1);
  }, [currentPath]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, onlyFeatured, page]);

  const fetchProducts = async (currentSearch: string = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (selectedCategory) params.set('category', selectedCategory);
      if (sortBy) params.set('sort', sortBy);
      if (onlyFeatured) params.set('featured', 'true');
      params.set('page', page.toString());
      params.set('limit', '16');

      const res = await fetch(`/api/public/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('newest');
    setOnlyFeatured(false);
    setPage(1);
    navigate('/catalogo');
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-purple-600" />
          <span>Catálogo de Achadinhos</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore todos os produtos selecionados com links oficiais e verificados do TikTok Shop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                Filtros
              </span>
              {(search || selectedCategory || onlyFeatured || sortBy !== 'newest') && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Categories filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categorias</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    !selectedCategory ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas as Categorias
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Only Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={e => {
                    setOnlyFeatured(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Apenas produtos em destaque</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Control Bar (Search, Sort, Mobile Filter Button) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search input in catalog */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrar por nome..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchProducts('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-3 py-2 text-xs font-bold bg-slate-100 rounded-xl flex items-center gap-1.5 text-slate-700 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
              </button>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={e => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-hidden focus:border-purple-500 cursor-pointer"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="popularity">Mais Clicados 🔥</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Mostrando <strong className="text-slate-900 font-bold">{products.length}</strong> de{' '}
              <strong className="text-slate-900 font-bold">{total}</strong> produtos encontrados
            </span>
            {selectedCategory && (
              <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                Categoria: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="hover:text-purple-900 cursor-pointer"
                >
                  <X className="w-3 h-3 ml-1" />
                </button>
              </span>
            )}
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-slate-100 animate-pulse aspect-3/4 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categoryName={getCategoryName(prod.category_id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {search || selectedCategory ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || selectedCategory
                  ? 'Tente ajustar os filtros, buscar por outras palavras-chave ou explorar todas as categorias.'
                  : 'Os produtos cadastrados no painel administrativo aparecerão listados aqui.'}
              </p>
              {search || selectedCategory ? (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              ) : (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Ir para o Painel Admin
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {total > 16 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500 font-semibold px-2">
                Página {page} de {Math.ceil(total / 16)}
              </span>
              <button
                disabled={page * 16 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Próxima
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  Filtros
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Categorias</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                        !selectedCategory ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      Todas as Categorias
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                          selectedCategory === cat.slug ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={e => setOnlyFeatured(e.target.checked)}
                      className="rounded-md border-slate-300 text-purple-600"
                    />
                    <span>Apenas em Destaque</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
