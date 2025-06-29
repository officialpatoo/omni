
"use client";

import React, { useEffect, useRef } from 'react';
import { Message, AiAction } from '@/types';
import { ChatMessageItem } from './chat-message-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  messages: Message[];
  onAction: (messageId: string, action: AiAction, context: any) => void;
}

export function ChatInterface({ messages, onAction }: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div ref={viewportRef} className="h-full">
        {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} onAction={onAction} />
        ))}
      </div>
    </ScrollArea>
  );
}
