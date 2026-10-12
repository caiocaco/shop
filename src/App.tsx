/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './views/HomeView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { InstitutionalView } from './views/InstitutionalView.tsx';
import { AdminView } from './views/AdminView.tsx';

const AppContent: React.FC = () => {
  const { currentPath } = useStore();

  const pathname = currentPath.split('?')[0];

  // Route matching
  if (pathname.startsWith('/admin')) {
    return <AdminView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <div className="flex-1">
        {(() => {
          if (pathname.startsWith('/catalogo')) {
            return <CatalogView />;
          }
          if (pathname.startsWith('/produto/')) {
            const slug = pathname.replace('/produto/', '');
            return <ProductDetailView slug={slug} />;
          }
          if (pathname === '/termos-de-uso') {
            return <InstitutionalView type="terms" />;
          }
          if (pathname === '/politica-de-privacidade') {
            return <InstitutionalView type="privacy" />;
          }
          if (pathname === '/divulgacao-afiliado') {
            return <InstitutionalView type="affiliate" />;
          }
          return <HomeView />;
        })()}
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
