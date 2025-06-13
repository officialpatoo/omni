
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import type { ChatSession } from '@/types';
import { PlusCircle, MessageSquare, Trash2, UserCircle, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppSidebarProps {
  chatHistory: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export function AppSidebar({
  chatHistory,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      onDeleteChat(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup className="p-2">
          <Button onClick={onNewChat} className="w-full justify-start">
            <PlusCircle className="mr-2 h-5 w-5" /> New Chat
          </Button>
        </SidebarGroup>

        {chatHistory.length > 0 && (
          <SidebarGroup className="p-2 pt-0">
            <SidebarGroupLabel className="flex items-center">
              <MessageSquare className="mr-2" /> Chat History
            </SidebarGroupLabel>
            <ScrollArea className="h-[calc(100vh_-_20rem)]"> {/* Adjust height as needed */}
              <SidebarMenu>
                {chatHistory.map((session) => (
                  <SidebarMenuItem key={session.id} className="relative group/menu-item">
                    <SidebarMenuButton
                      onClick={() => onSelectChat(session.id)}
                      isActive={session.id === currentChatId && (pathname === '/' || pathname.startsWith('/chat'))}
                      className="truncate"
                    >
                      {session.title || `Chat ${session.id.substring(0, 8)}`}
                    </SidebarMenuButton>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/menu-item:opacity-100 focus:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent SidebarMenuButton onClick
                          setSessionToDelete(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <UserCircle className="mr-2" /> User Account
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/auth/login" legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname === '/auth/login'}>
                  <a><LogIn className="mr-2" /> Login</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/auth/signup" legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname === '/auth/signup'}>
                  <a><UserPlus className="mr-2" /> Sign Up</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/auth/login" legacyBehavior passHref> {/* Placeholder: redirects to login */}
                <SidebarMenuButton asChild>
                   <a><LogOut className="mr-2" /> Logout</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* Example for a settings link if needed later
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" legacyBehavior passHref>
              <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                <a><Settings className="mr-2" /> Settings</a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        */}
      </SidebarFooter>

      {sessionToDelete && (
        <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this chat session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Sidebar>
  );
}
