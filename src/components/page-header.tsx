
"use client";

import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function PageHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8" />
        <Logo />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
