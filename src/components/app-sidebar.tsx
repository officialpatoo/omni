
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
import { PlusCircle, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
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
  editingSessionDetails: { id: string; currentTitle: string } | null;
  onStartEditChatSession: (id: string, currentTitle: string) => void;
  onSaveChatSessionTitle: (id: string, newTitle: string) => void;
  onCancelEditChatSession: () => void;
}

export function AppSidebar({
  chatHistory,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  editingSessionDetails,
  onStartEditChatSession,
  onSaveChatSessionTitle,
  onCancelEditChatSession,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (editingSessionDetails) {
      setEditedTitle(editingSessionDetails.currentTitle);
    }
  }, [editingSessionDetails]);

  const handleSave = (sessionId: string) => {
    onSaveChatSessionTitle(sessionId, editedTitle);
  };

  const handleCancel = () => {
    onCancelEditChatSession();
  };
  
  const defaultTitle = (sessionId: string) => `Chat ${sessionId.substring(0, 8)}`;

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
                  <SidebarMenuItem key={session.id} className="relative group/menu-item">
                    {editingSessionDetails && editingSessionDetails.id === session.id ? (
                      <div className="p-1 flex items-center gap-1 w-full">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSave(session.id);
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancel();
                            }
                          }}
                          className="h-8 flex-1 text-sm px-2 py-1"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleSave(session.id)} className="h-8 w-8" aria-label="Save title">
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8" aria-label="Cancel edit">
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <SidebarMenuButton
                          onClick={() => onSelectChat(session.id)}
                          isActive={session.id === currentChatId && (pathname === '/' || pathname.startsWith('/chat'))}
                          className="truncate w-full"
                          tooltip={session.title || defaultTitle(session.id)}
                        >
                           <MessageSquare />
                           <span className="truncate flex-1 text-left">{session.title || defaultTitle(session.id)}</span>
                        </SidebarMenuButton>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/menu-item:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent chat selection
                              onStartEditChatSession(session.id, session.title || defaultTitle(session.id));
                            }}
                            aria-label="Edit chat title"
                            title="Edit title"
                          >
                            <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
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
                                  This action cannot be undone. This will permanently delete the chat session titled: "<strong>{session.title || defaultTitle(session.id)}</strong>".
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
                        </div>
                      </>
                    )}
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
      </SidebarFooter>
    </Sidebar>
  );
}

    