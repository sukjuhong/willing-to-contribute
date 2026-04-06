import Link from 'next/link';
import Footer from '@/app/components/Footer';
import AdSidebar from '@/app/components/AdSidebar';

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/issues"
            className="text-2xl font-bold text-foreground font-[family-name:var(--font-mono)] hover:text-primary transition-colors"
          >
            <span className="text-muted-foreground">&gt;_</span> contrifit
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/issues"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              Issues
            </Link>
            <Link
              href="/repositories"
              className="text-foreground hover:text-primary transition-colors text-sm"
            >
              Repositories
            </Link>
          </nav>
        </div>
      </header>
      <div className="relative flex-1">
        <AdSidebar position="left" />
        <main className="container mx-auto px-4 py-12 max-w-4xl">{children}</main>
        <AdSidebar position="right" />
      </div>
      <Footer />
    </div>
  );
}
