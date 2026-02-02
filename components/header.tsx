'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bot } from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/study', label: 'Study' },
  { href: '#', label: 'CAD' },
  { href: '#', label: 'Lab' },
];

interface HeaderProps {
  onCopilotClick?: () => void;
  showCopilot?: boolean;
}

export function Header({ onCopilotClick, showCopilot = false }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary glow-cyan" />
          <span className="font-semibold text-lg tracking-tight text-foreground">
            SIMVEX
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/study' && pathname.startsWith('/study'));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Copilot Button */}
      {showCopilot && onCopilotClick && (
        <button
          onClick={onCopilotClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors text-sm"
        >
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-foreground">Copilot</span>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>
      )}
    </header>
  );
}
