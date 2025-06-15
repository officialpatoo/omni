
"use client";

import React from 'react';
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
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
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

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup className="p-2">
          <SidebarMenuButton 
            onClick={onNewChat} 
            className="w-full justify-start"
            tooltip="New Chat"
            aria-label="Start a new chat"
          >
            <PlusCircle /> <span>New Chat</span>
          </SidebarMenuButton>
        </SidebarGroup>

        {chatHistory.length > 0 && (
          <SidebarGroup className="p-2 pt-0">
            <SidebarGroupLabel className="flex items-center">
              <MessageSquare /> Chat History
            </SidebarGroupLabel>
            <ScrollArea className="h-[calc(100vh_-_12rem)]"> {/* Adjusted height */}
              <SidebarMenu>
                {chatHistory.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <AlertDialog>
                      <SidebarMenuButton
                        onClick={() => onSelectChat(session.id)}
                        isActive={session.id === currentChatId && (pathname === '/' || pathname.startsWith('/chat'))}
                        className="truncate"
                        tooltip={session.title || `Chat ${session.id.substring(0, 8)}`}
                      >
                         <MessageSquare /><span>{session.title || `Chat ${session.id.substring(0, 8)}`}</span>
                      </SidebarMenuButton>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/menu-item:opacity-100 focus:opacity-100"
                          onClick={(e) => e.stopPropagation()} 
                          aria-label="Delete chat session"
                          title="Delete chat"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the chat session titled: "<strong>{session.title || `Chat ${session.id.substring(0, 8)}`}</strong>".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteChat(session.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        {/* Placeholder for any footer content if auth is removed, e.g. settings or help */}
        {/* For now, it's empty */}
      </SidebarFooter>
    </Sidebar>
  );
}
