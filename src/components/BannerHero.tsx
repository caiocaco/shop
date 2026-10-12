import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const BannerHero: React.FC = () => {
  const { settings, navigate } = useStore();

  if (!settings.hero_banner_enabled) return null;

  const logoImg = settings.logo_url || '/src/assets/images/logo_achados_1791805418762.jpg';

  return (
    <div className="relative overflow-hidden bg-slate-950 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 text-white shadow-2xl border border-amber-500/20">
      {/* Background Image with Dark Vignette Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.hero_banner_image || '/src/assets/images/hero_achados_1791805439218.jpg'}
          alt="Banner Promocional Achados do TikTok Shop"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-amber-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:px-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Text & Actions */}
        <div className="max-w-2xl flex-1 text-center lg:text-left">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-xs font-bold text-amber-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curadoria Oficial • Tendências do TikTok Shop</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {settings.hero_banner_title}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {settings.hero_banner_subtitle}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => navigate('/catalogo')}
              className="px-7 py-3.5 rounded-xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-98 cursor-pointer"
            >
              <span>{settings.hero_banner_cta || 'Explorar Catálogo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/catalogo?sort=popularity')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Ver Mais Clicados</span>
            </button>
          </div>

          {/* Security and Transparency Trust Pillars */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Links 100% seguros e verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Finalização direta no TikTok Shop</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Atualização diária de achadinhos</span>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Logo Emblem Feature */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse"></div>

            {/* Emblem Image Frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full p-2 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 shadow-2xl">
              <img
                src={logoImg}
                alt="Achados do TikTok Shop"
                className="w-full h-full object-cover rounded-full shadow-inner bg-black"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
