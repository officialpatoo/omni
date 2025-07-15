
"use client";

import Image from 'next/image';
import { Message, AiAction } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Copy, Share2, Loader2, RefreshCcw, Languages, Expand, Lightbulb, Volume2, Square } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/logo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';

interface ChatMessageItemProps {
  message: Message;
  onAction: (messageId: string, action: AiAction, context: any) => void;
  audioState: {
    playingMessageId: string | null;
    loadingMessageId: string | null;
  };
  onStopPlayback: () => void;
}

const STREAMING_SPEED = 20; // Lower is faster

export function ChatMessageItem({ message, onAction, audioState, onStopPlayback }: ChatMessageItemProps) {
  const { toast } = useToast();
  const [displayedText, setDisplayedText] = useState('');
  
  const isUser = message.role === 'user';
  const isPlaying = audioState.playingMessageId === message.id;
  const isLoadingAudio = audioState.loadingMessageId === message.id;

  useEffect(() => {
    if (message.role === 'assistant' && !message.isLoading && !message.error) {
      setDisplayedText(''); // Reset on new message
      
      const words = message.text.split(' ');
      let currentText = '';
      let wordIndex = 0;

      const intervalId = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
          setDisplayedText(currentText);
          wordIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, STREAMING_SPEED);

      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(message.text);
    }
  }, [message.text, message.role, message.isLoading, message.error]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
      .then(() => {
        toast({ title: "Copied to clipboard!" });
      })
      .catch(err => {
        toast({ title: "Failed to copy", description: err.message, variant: "destructive" });
      });
  };

  const handleShare = () => {
    const shareText = encodeURIComponent(message.text);
    // Simplified: Just Twitter. Could expand to use Web Share API if available.
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };
  
  const handleReadAloudClick = () => {
    if (isPlaying) {
      onStopPlayback();
    } else {
      onAction(message.id, 'read_aloud', null);
    }
  }

  const renderedText = isUser ? message.text : displayedText;

  return (
    <div className={cn("flex items-start gap-3 py-4 animate-fade-in-up", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Logo fill className="h-8 w-8 shrink-0" />
      )}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] rounded-lg p-3 shadow-md",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-card text-card-foreground border"
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : message.error ? (
          <p className="text-destructive">{message.error}</p>
        ) : (
          <>
            {message.imageUrl && (
              <div className="mb-2 overflow-hidden rounded">
                <Image
                  src={message.imageUrl}
                  alt="User upload"
                  width={300}
                  height={200}
                  className="object-contain rounded"
                  data-ai-hint="uploaded image"
                />
              </div>
            )}
            <article className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:p-2 prose-pre:rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {renderedText}
              </ReactMarkdown>
            </article>
            {!isUser && message.text && (
              <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                 <Button variant="ghost" size="sm" onClick={handleReadAloudClick} className="text-xs h-7 px-2">
                  {isLoadingAudio ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="mr-1 h-3 w-3" />
                  ) : (
                    <Volume2 className="mr-1 h-3 w-3" />
                  )}
                  {isPlaying ? 'Stop' : 'Read Aloud'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7 px-2">
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs h-7 px-2">
                  <Share2 className="mr-1 h-3 w-3" /> Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      <RefreshCcw className="mr-1 h-3 w-3" /> Rephrase
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onAction(message.id, 'rephrase', { style: 'simpler' })}>
                      Make Simpler
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(message.id, 'rephrase', { style: 'more formal' })}>
                      Make More Formal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={() => onAction(message.id, 'translate', { language: 'Spanish' })} className="text-xs h-7 px-2">
                  <Languages className="mr-1 h-3 w-3" /> Translate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction(message.id, 'expand', null)} className="text-xs h-7 px-2">
                  <Expand className="mr-1 h-3 w-3" /> Expand
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onAction(message.id, 'improve_prompt', null)} className="text-xs h-7 px-2">
                  <Lightbulb className="mr-1 h-3 w-3" /> Improve Prompt
                </Button>
              </div>
            )}
          </>
        )}
        <p className={cn(
            "text-xs mt-1",
            isUser ? "text-secondary-foreground/70" : "text-muted-foreground"
          )}>
            {message.timestamp.toLocaleTimeString()}
          </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
