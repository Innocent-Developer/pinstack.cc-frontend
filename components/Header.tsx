'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import AddProductButton from './AddProductButton';
import AccountVerifiedTick from './AccountVerifiedTick';
import { clearAuth, getStoredUser, StoredUser } from '../lib/auth';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener('pinstack-auth', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('pinstack-auth', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-borderC transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <BrandLogo variant="lockup" priority size={34} />

        <nav className="hidden lg:flex items-center gap-8 text-sm text-body" aria-label="Primary">
          <Link href="/explore" className="hover:text-primary transition">
            Explore
          </Link>
          <Link href="/categories" className="hover:text-primary transition">
            Categories
          </Link>
          <Link href="/#trending" className="hover:text-primary transition">
            Trending
          </Link>
          <Link href="/pricing" className="hover:text-primary transition">
            Pricing
          </Link>
          <Link href="/blog" className="hover:text-primary transition">
            Blog
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              href="/dashboard/profile"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-primary max-w-[140px]"
            >
              <span className="truncate">{user.name.split(' ')[0]}</span>
              {user.isAccountVerified ? <AccountVerifiedTick size={14} /> : null}
            </Link>
          )}
          <AddProductButton className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/25 btn-smooth" />
          <button
            type="button"
            className="lg:hidden p-2 text-heading"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="block w-5 h-0.5 bg-heading mb-1" />
            <span className="block w-5 h-0.5 bg-heading mb-1" />
            <span className="block w-5 h-0.5 bg-heading" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-borderC px-4 sm:px-6 py-4 flex flex-col gap-3 text-sm text-body bg-white"
          aria-label="Mobile"
        >
          <Link href="/explore" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Explore
          </Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Categories
          </Link>
          <Link href="/#trending" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Trending
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Pricing
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Blog
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            About
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-primary">
            Contact
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-primary font-semibold">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="hover:text-primary font-semibold">
                Profile
              </Link>
              <button type="button" onClick={handleLogout} className="text-left hover:text-primary">
                Log out
              </button>
            </>
          ) : null}
          <AddProductButton onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
    </header>
  );
}
