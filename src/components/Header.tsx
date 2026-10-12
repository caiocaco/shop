import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Search, ShoppingBag, Menu, X, ShieldCheck, Flame, Star, Sparkles, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, categories, navigate, currentPath } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Achadinhos Verificados do TikTok Shop • Preços oficiais e links diretos</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <button
              onClick={() => navigate('/divulgacao-afiliado')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Divulgação de Afiliado
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => navigate('/admin')}
              className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold text-purple-400"
            >
              <span>Painel Admin</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Store Name */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name}
                className="h-12 w-12 rounded-full object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform bg-black"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                style={{ backgroundColor: settings.primary_color || '#7c3aed' }}
              >
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                {settings.store_name}
              </span>
              <span className="hidden sm:block text-xs text-slate-500 font-medium">
                {settings.tagline.slice(0, 48)}...
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar fones, projetores, maquiagens e achadinhos..."
                className="w-full pl-11 pr-24 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-opacity hover:opacity-95 cursor-pointer shadow-xs"
                style={{ backgroundColor: settings.button_color || '#7c3aed' }}
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                isActive('/') ? 'text-purple-600 bg-purple-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => navigate('/catalogo')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPath.startsWith('/catalogo') && !currentPath.includes('sort=popularity') && !currentPath.includes('featured=true')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => navigate('/catalogo?sort=popularity')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPath.includes('sort=popularity')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Mais Clicados</span>
            </button>
            <button
              onClick={() => navigate('/catalogo?featured=true')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPath.includes('featured=true')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Destaques</span>
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar achadinhos..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-100 text-sm rounded-full border border-transparent focus:border-purple-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold text-white rounded-full"
              style={{ backgroundColor: settings.button_color || '#7c3aed' }}
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-100 text-slate-800"
          >
            Início
          </button>
          <button
            onClick={() => {
              navigate('/catalogo');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-100 text-slate-800"
          >
            Catálogo Completo
          </button>
          <button
            onClick={() => {
              navigate('/catalogo?sort=popularity');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-100 text-slate-800 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            Mais Clicados
          </button>
          <button
            onClick={() => {
              navigate('/catalogo?featured=true');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-100 text-slate-800 flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-amber-500" />
            Destaques da Semana
          </button>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-4 mb-2">Categorias</p>
            <div className="grid grid-cols-2 gap-1 px-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/catalogo?category=${encodeURIComponent(cat.slug)}`);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs text-slate-600 hover:text-purple-700 py-1.5 px-2 rounded-md hover:bg-purple-50 truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-4">
            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>Acessar Painel Admin</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                navigate('/divulgacao-afiliado');
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-500 hover:underline"
            >
              Aviso de Afiliado
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
