'use client';

import { AppProvider, useApp } from '@/app/contexts/AppContext';
import Header from '@/app/components/Header';
import Navigation from '@/app/components/Navigation';
import AdSidebar from '@/app/components/AdSidebar';
import Footer from '@/app/components/Footer';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { authState, login, logout } = useApp();

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <Header
        authState={authState}
        onAppLogin={login}
        onLogout={logout}
        showAppLogin={!authState.isLoggedIn}
      />

      <div className="flex-1 relative">
        <AdSidebar position="left" />
        <main className="container mx-auto px-4 py-8">
          <Navigation />
          {children}
        </main>
        <AdSidebar position="right" />
      </div>
      <Footer />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </AppProvider>
  );
}
