'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SimvexLogo } from '@/components/study-header';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/study', label: 'Study' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header
      role="banner"
      className="h-[64px] bg-[#0a0f1a]/50 backdrop-blur-sm border-b border-[#595959]/30 flex items-end pl-6 pb-3"
    >
      <nav aria-label="메인 네비게이션" className="flex items-end gap-0">
        <Link
          href="/"
          aria-label="SIMVEX 홈으로 이동"
          className="mb-[-4px] mr-6 xl:mr-[42px]"
        >
          <SimvexLogo />
        </Link>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/study' && pathname.startsWith('/study'));

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center px-4 lg:px-6 xl:px-8"
            >
              <span
                className={`text-base xl:text-[18px] font-semibold tracking-wide pb-1.5 transition-colors ${
                  isActive
                    ? 'text-[#FAFAFA]'
                    : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA]/80'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-[#2563EB] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
