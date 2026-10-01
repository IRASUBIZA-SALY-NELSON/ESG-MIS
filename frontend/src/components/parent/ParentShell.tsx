'use client';
import { useUserContext } from '@/context/Usercontext';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiHome, FiLogOut, FiMessageCircle, FiUser } from 'react-icons/fi';

const MENU = [
  { href: '/parent', label: 'Children', icon: FiHome },
  { href: '/parent/concerns', label: 'Messages', icon: FiMessageCircle },
  { href: '/parent/profile', label: 'Profile', icon: FiUser },
];

const isActive = (href: string, path: string) => {
  if (href === '/parent') return path === '/parent' || path.startsWith('/parent/children');
  return path.startsWith(href);
};

const HamburgerButton = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-xl active:bg-black/5"
  >
    <span className="relative block h-[18px] w-[22px]">
      <span
        className={`absolute left-0 block h-[3px] w-[22px] rounded-full bg-primary transition-all duration-200 ${
          open ? 'top-[7.5px] rotate-45' : 'top-0'
        }`}
      />
      <span
        className={`absolute left-0 top-[7.5px] block h-[3px] w-[22px] rounded-full bg-primary transition-opacity duration-150 ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute left-0 block h-[3px] w-[22px] rounded-full bg-primary transition-all duration-200 ${
          open ? 'top-[7.5px] -rotate-45' : 'top-[15px]'
        }`}
      />
    </span>
  </button>
);

export default function ParentShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile } = useUserContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const logout = () => {
    localStorage.removeItem('rcaappuser');
    localStorage.removeItem('token');
    deleteCookie('role');
    deleteCookie('token');
    window.location.href = '/auth/login';
  };

  return (
    <div className="h-[100svh] bg-[#F3F6F4] flex flex-col print:h-auto print:bg-white">
      <header className="shrink-0 z-50 bg-white border-b print:hidden">
        <div className="flex items-center h-14 max-w-lg mx-auto w-full px-1">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          <Link href="/parent" className="min-w-0">
            <span className="font-semibold text-primary text-[15px] leading-tight">ESG Parents</span>
          </Link>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-14 z-40 print:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[min(20rem,86vw)] bg-white shadow-2xl flex flex-col">
            <div className="bg-primary text-white px-5 py-5">
              <p className="text-lg font-semibold leading-tight">
                {profile?.firstName ? `Hi, ${profile.firstName}` : 'Menu'}
              </p>
              <p className="text-sm text-white/70 mt-0.5">Ecole des Sciences de Gisenyi</p>
            </div>

            <nav className="flex-1 px-3 py-2">
              {MENU.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, path);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 min-h-14 px-3 rounded-xl text-[17px] ${
                      active ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-800'
                    }`}
                  >
                    <Icon size={22} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 min-h-14 px-3 w-full rounded-xl text-[17px] text-red-600"
              >
                <FiLogOut size={22} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-4 pb-6 overflow-y-auto print:max-w-none print:px-0 print:overflow-visible">
        {children}
      </main>
    </div>
  );
}
