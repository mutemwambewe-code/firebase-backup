'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { navLinks, settingsLink } from './nav-links';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground sm:flex sm:flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link
            href="/dashboard"
            className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 transition-all group-hover:scale-110"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="sr-only">PropEase Zambia</span>
          </Link>
          <TooltipProvider>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:text-foreground',
                      pathname.startsWith(href)
                        ? 'bg-sidebar-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={settingsLink.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground',
                     pathname.startsWith(settingsLink.href) && 'text-foreground'
                  )}
                >
                  <settingsLink.icon className="h-5 w-5" />
                  <span className="sr-only">{settingsLink.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{settingsLink.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
