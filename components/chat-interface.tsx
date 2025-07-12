
"use client";

import React, { useEffect, useRef, UIEvent } from 'react';
import { Message, AiAction } from '@/types';
import { ChatMessageItem } from './chat-message-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  messages: Message[];
  onAction: (messageId: string, action: AiAction, context: any) => void;
  audioState: {
    playingMessageId: string | null;
    loadingMessageId: string | null;
  };
  onStopPlayback: () => void;
  onScroll?: (isScrollingDown: boolean) => void;
}

export function ChatInterface({ messages, onAction, audioState, onStopPlayback, onScroll }: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      // Use requestAnimationFrame to scroll after the new message has been rendered
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
      });
    }
  }, [messages]);
  
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!onScroll) return;
    
    const target = event.currentTarget;
    const currentScrollTop = target.scrollTop;
    
    // Threshold to prevent flickering on minor scrolls
    if (Math.abs(currentScrollTop - lastScrollTop.current) < 10) {
      return;
    }
    
    const isScrollingDown = currentScrollTop > lastScrollTop.current && currentScrollTop > 0;
    
    onScroll(isScrollingDown);
    lastScrollTop.current = currentScrollTop;
  };


  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef} viewportRef={viewportRef} onScroll={handleScroll}>
      <div className="px-4 py-2">
        {messages.map((msg) => (
            <ChatMessageItem 
              key={msg.id} 
              message={msg} 
              onAction={onAction} 
              audioState={audioState}
              onStopPlayback={onStopPlayback}
            />
        ))}
      </div>
    </ScrollArea>
  );
}
