"use client";

import Image from 'next/image';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Copy, Share2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '@/components/logo';

interface ChatMessageItemProps {
  message: Message;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { toast } = useToast();
  const isUser = message.role === 'user';

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

  return (
    <div className={cn("flex items-start gap-3 py-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Logo fill className="h-8 w-8 shrink-0" />
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3 shadow-md",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
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
            {/* Using whitespace-pre-wrap to respect newlines from AI */}
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
            {!isUser && message.text && (
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7 px-2">
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs h-7 px-2">
                  <Share2 className="mr-1 h-3 w-3" /> Share
                </Button>
              </div>
            )}
          </>
        )}
        <p className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
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
