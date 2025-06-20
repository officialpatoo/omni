
"use client";

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { ChatMessageItem } from './chat-message-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/logo';

interface ChatInterfaceProps {
  messages: Message[];
}

export function ChatInterface({ messages }: ChatInterfaceProps) {
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
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Logo width={200} height={200} priority />
        </div>
      ) : (
        messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
      )}
      </div>
    </ScrollArea>
  );
}
