'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PanelLeft, Settings, Sun, Moon, Building, LogOut } from 'lucide-react';
import { useTheme } from '@/components/providers/app-providers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navLinks, settingsLink } from './nav-links';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface HeaderProps {
  showTitle: boolean;
  pageTitle: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({ showTitle, pageTitle, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border">
          <nav className="grid gap-4 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 shrink-0 items-center justify-start gap-2 text-lg font-semibold text-primary md:text-base"
            >
              <Building className="h-6 w-6" />
              <span className="font-bold text-xl text-foreground">PropBot</span>
            </Link>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn("flex items-center gap-4 px-2.5 rounded-lg",
                  pathname.startsWith(href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
           <nav className="mt-auto grid gap-4">
              <Link
                href={settingsLink.href}
                className={cn("flex items-center gap-4 px-2.5 rounded-lg",
                  pathname.startsWith(settingsLink.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <settingsLink.icon className="h-5 w-5" />
                {settingsLink.label}
              </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="flex-1">
        <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-300",
            showTitle ? "opacity-100" : "opacity-0 -translate-y-6"
          )}>
          <h1 className="font-semibold text-lg">{pageTitle}</h1>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
            <Avatar className="h-9 w-9">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
              ) : userAvatar ? (
                 <AvatarImage asChild src={userAvatar.imageUrl}>
                   <Image src={userAvatar.imageUrl} width={36} height={36} alt="User Avatar" data-ai-hint={userAvatar.imageHint} className="rounded-full" />
                 </AvatarImage>
              ) : null}
              <AvatarFallback>{user?.displayName?.charAt(0) ?? user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4"/>
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4 mr-2"/> : <Moon className="w-4 h-4 mr-2"/>}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
