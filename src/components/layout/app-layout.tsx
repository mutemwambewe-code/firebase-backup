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
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground sm:flex flex-col sticky top-0 h-screen">
          <nav className="flex flex-col items-center gap-4 px-2 py-4 flex-1">
            <Link
              href="/dashboard"
              className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
              <span className="sr-only">PropBot</span>
            </Link>
            <TooltipProvider>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        pathname.startsWith(href)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
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
          <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={settingsLink.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                       pathname.startsWith(settingsLink.href) && 'bg-sidebar-accent text-sidebar-accent-foreground'
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
