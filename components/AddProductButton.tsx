'use client';

import Link from 'next/link';
import { getStoredUser } from '../lib/auth';
import { useEffect, useState } from 'react';

interface AddProductButtonProps {
  className?: string;
  label?: string;
  onNavigate?: () => void;
}

/** Guests → login; signed-in users → add-product wizard */
export default function AddProductButton({
  className = 'px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20 transition',
  label = 'Add Your Product',
  onNavigate,
}: AddProductButtonProps) {
  const [href, setHref] = useState('/login?next=/dashboard/add-product');

  useEffect(() => {
    const sync = () => {
      setHref(getStoredUser() ? '/dashboard/add-product' : '/login?next=/dashboard/add-product');
    };
    sync();
    window.addEventListener('pinstack-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('pinstack-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {label}
      <span className="ml-1 opacity-80" aria-hidden>
        +
      </span>
    </Link>
  );
}
