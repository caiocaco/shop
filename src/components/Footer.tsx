import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ShoppingBag, Instagram, MessageCircle, Youtube, ShieldAlert, Heart, ExternalLink, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories, navigate } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-16 border-t border-slate-900">
      {/* Transparency & Disclaimer Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs leading-relaxed text-slate-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="text-white font-semibold">Divulgação de Afiliado e Transparência: </strong>
            {settings.affiliate_disclaimer}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer text-white font-black text-xl"
            >
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className="w-9 h-9 rounded-full object-cover border border-amber-400 shadow-xs bg-black"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: settings.primary_color || '#f59e0b' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
              <span>{settings.store_name}</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.tagline}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.social_links?.instagram && (
                <a
                  href={settings.social_links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.social_links?.whatsapp && (
                <a
                  href={settings.social_links.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings.social_links?.youtube && (
                <a
                  href={settings.social_links.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogo')} className="hover:text-white transition-colors cursor-pointer">
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogo?sort=popularity')} className="hover:text-white transition-colors cursor-pointer">
                  Mais Clicados
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogo?featured=true')} className="hover:text-white transition-colors cursor-pointer">
                  Destaques da Semana
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Categorias</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate(`/catalogo?category=${encodeURIComponent(cat.slug)}`)}
                    className="hover:text-white transition-colors cursor-pointer truncate max-w-[180px] text-left block"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional / Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Institucional</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/divulgacao-afiliado')} className="hover:text-white transition-colors cursor-pointer">
                  Divulgação de Afiliado
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/termos-de-uso')} className="hover:text-white transition-colors cursor-pointer">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/politica-de-privacidade')} className="hover:text-white transition-colors cursor-pointer">
                  Política de Privacidade
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Painel Administrativo</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div>{settings.footer_text}</div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para criadores e afiliados</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
