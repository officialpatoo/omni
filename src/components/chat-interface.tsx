
"use client";

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { ChatMessageItem } from './chat-message-item';
import { ScrollArea } from '@/components/ui/scroll-area';

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
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-question text-muted-foreground mb-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <h2 className="text-xl font-semibold text-foreground mb-1">Welcome to PATOOWORLD PA!</h2>
            <p className="text-muted-foreground">Ask me anything, or upload an image for analysis.</p>
        </div>
      ) : (
        messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
      )}
      </div>
    </ScrollArea>
  );
}
