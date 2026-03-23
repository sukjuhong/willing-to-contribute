import Link from 'next/link';
import Footer from '@/app/components/Footer';
import AdSidebar from '@/app/components/AdSidebar';

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <header className="bg-[#161b22] border-b border-gray-700 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/issues"
            className="text-2xl font-bold text-gray-100 font-[family-name:var(--font-mono)] hover:text-cyan-400 transition-colors"
          >
            <span className="text-gray-500">&gt;_</span> Willing to Contribute
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/issues"
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Issues
            </Link>
            <Link
              href="/repositories"
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
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
