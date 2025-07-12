
"use client";

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, LogIn, UserPlus, LogOut, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  isVisible: boolean;
}

export function PageHeader({ isVisible }: PageHeaderProps) {
  const { user, isLoading, signOut } = useAuth();
  const { isMobile, state: sidebarState } = useSidebar();

  return (
    <header className={cn(
      "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4 transition-transform duration-300",
      !isVisible && "-translate-y-full sm:translate-y-0"
    )}>
      {/* Left items container */}
      <div className="flex items-center">
        {user && <SidebarTrigger className="h-8 w-8" />}
      </div>

      {/* Center items container (for Logo) */}
      <div className="flex-1 flex justify-center">
        {/* Logo is visible on mobile OR when sidebar is collapsed on desktop */}
        {(isMobile || sidebarState === 'collapsed') && <Logo />}
      </div>

      {/* Right items container */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                  <AvatarFallback>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserCircle/>)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
            <Link href="/auth/signup">
               <Button className="hidden sm:flex">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
               </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
