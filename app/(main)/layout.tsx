'use client';

import { AppProvider, useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import SyncModal from '../components/SyncModal';
import AdSidebar from '../components/AdSidebar';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    authState,
    login,
    logout,
    showSyncModal,
    setShowSyncModal,
    handleSync,
    settings,
    gistSettings,
  } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        authState={authState}
        onAppLogin={login}
        onLogout={logout}
        showAppLogin={!authState.isLoggedIn}
      />

      <div className="relative">
        <AdSidebar position="left" />
        <main className="container mx-auto px-4 py-8">
          <Navigation />
          {children}
        </main>
        <AdSidebar position="right" />
      </div>

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSync={handleSync}
        localRepositories={settings.repositories}
        gistRepositories={gistSettings?.repositories || []}
      />
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
