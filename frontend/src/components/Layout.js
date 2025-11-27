/**
 * Layout Component
 * 
 * Provides consistent page structure with header, navigation, and footer.
 * Protects routes that require authentication.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title = 'Customer Portal' }) {
  const { customer, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[--color-text-secondary]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Background with subtle gradient */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0f14] via-[#0f1419] to-[#121820]" />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-[--color-bg-primary]/80 backdrop-blur-lg border-b border-[--color-border]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Brand */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-semibold text-white">Customer Portal</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden sm:flex items-center gap-6">
                <Link 
                  href="/" 
                  className={`text-sm font-medium transition-colors ${
                    router.pathname === '/' 
                      ? 'text-brand-400' 
                      : 'text-[--color-text-secondary] hover:text-white'
                  }`}
                >
                  My Bookings
                </Link>
              </nav>

              {/* User menu */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                  <p className="text-xs text-[--color-text-secondary]">
                    {customer?.email}
                  </p>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[--color-text-secondary] hover:text-white hover:bg-[--color-bg-tertiary] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-[--color-border]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-[--color-text-secondary]">
              Customer Portal POC • Powered by ServiceM8
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

