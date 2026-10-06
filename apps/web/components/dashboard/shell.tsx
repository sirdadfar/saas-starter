'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/projects', label: 'Projects' },
  { href: '/dashboard/settings/profile', label: 'Profile' },
  { href: '/dashboard/settings/organization', label: 'Organization' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold">SaaS Starter</Link>
          <button type="button" aria-expanded={open} aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        {open && (
          <nav id="mobile-navigation" className="space-y-1 border-t border-[var(--border)] p-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm ${path === link.href ? 'bg-neutral-100 font-medium dark:bg-neutral-900' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="mx-auto min-h-screen max-w-[1600px] md:grid md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] p-5 md:block">
          <div className="sticky top-5">
            <Link href="/dashboard" className="mb-8 block text-lg font-semibold">SaaS Starter</Link>
            <nav className="space-y-1" aria-label="Main navigation">
              {links.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm ${path === link.href ? 'bg-neutral-100 font-medium dark:bg-neutral-900' : 'text-neutral-600 dark:text-neutral-400'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <button type="button" onClick={logout}
              className="mt-8 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900">
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
