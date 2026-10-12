import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Category } from '../types.ts';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  categories: Category[];
  loadingSettings: boolean;
  currentPath: string;
  navigate: (path: string) => void;
  trackAndRedirect: (productId: string, source?: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'TokShop Achadinhos',
  tagline: 'Os melhores achadinhos e tendências do TikTok Shop com desconto exclusivo',
  logo_url: '',
  favicon_url: '',
  primary_color: '#7c3aed',
  secondary_color: '#ec4899',
  button_color: '#7c3aed',
  background_color: '#f8fafc',
  text_color: '#0f172a',
  card_radius: 'rounded-2xl',
  hero_banner_title: 'Achadinhos Virais do TikTok Shop',
  hero_banner_subtitle: 'Descubra os produtos mais recomendados e testados por criadores com as melhores ofertas e cupons da plataforma.',
  hero_banner_image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80',
  hero_banner_cta: 'Explorar Catálogo',
  hero_banner_enabled: true,
  featured_section_title: '⭐ Destaques da Semana',
  featured_section_enabled: true,
  most_clicked_section_title: '🔥 Mais Clicados no TikTok Shop',
  most_clicked_section_enabled: true,
  recent_section_title: '✨ Lançamentos e Recentes',
  recent_section_enabled: true,
  items_per_section: 8,
  header_links: [
    { label: 'Início', url: '/' },
    { label: 'Catálogo', url: '/catalogo' },
    { label: 'Mais Clicados', url: '/catalogo?sort=popularity' },
    { label: 'Destaques', url: '/catalogo?featured=true' }
  ],
  footer_text: '© 2026 TokShop Achadinhos. Todos os direitos reservados. Não somos uma loja oficial do TikTok, apenas curadores afiliados autorizados.',
  affiliate_disclaimer: 'Transparência: Este site contém links de afiliado do TikTok Shop. Ao clicar e concluir uma compra na loja parceira, podemos receber uma comissão sem qualquer custo adicional para você.',
  social_links: {
    instagram: 'https://instagram.com/tokshop.achadinhos',
    tiktok: 'https://tiktok.com/@tokshop.achadinhos',
    whatsapp: 'https://wa.me/5511999999999',
    youtube: 'https://youtube.com'
  },
  seo_title: 'TokShop - Os Melhores Achadinhos e Afiliados do TikTok Shop',
  seo_description: 'Encontre os melhores produtos virais testados no TikTok com links de afiliado oficiais.',
  seo_keywords: 'achadinhos tiktok shop, produtos virais, afiliados tiktok, compras tiktok',
  contact_email: 'contato@tokshop.com.br'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Browser navigation sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/public/config');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          applyDynamicTheme(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/public/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Apply CSS custom properties dynamically to :root
  const applyDynamicTheme = (st: StoreSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', st.primary_color || '#7c3aed');
    root.style.setProperty('--color-secondary', st.secondary_color || '#ec4899');
    root.style.setProperty('--color-button', st.button_color || '#7c3aed');
    root.style.setProperty('--color-bg', st.background_color || '#f8fafc');
    root.style.setProperty('--color-text', st.text_color || '#0f172a');

    if (st.seo_title) {
      document.title = st.seo_title;
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshCategories();
  }, []);

  // Track click and redirect securely
  const trackAndRedirect = async (productId: string, source: string = 'product_card') => {
    try {
      const response = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          source,
          referer: window.location.href
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.affiliate_url) {
          window.open(data.affiliate_url, '_blank', 'noopener,noreferrer');
          return;
        }
      }
    } catch (err) {
      console.error('Click tracking error:', err);
    }

    // Fallback: open via backend friendly redirect route
    window.open(`/r/${productId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        loadingSettings,
        currentPath,
        navigate,
        trackAndRedirect,
        showToast,
        refreshSettings,
        refreshCategories
      }}
    >
      {children}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-xl text-white text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-900'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
