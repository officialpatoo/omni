
"use client";

import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, Camera, XCircle, Loader2, Search } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Switch } from './ui/switch';


interface InputAreaProps {
  onSendMessage: (text: string, options: { imageFile?: File, useRealtimeSearch?: boolean }) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
}

export function InputArea({ onSendMessage, isLoading, onOpenCamera }: InputAreaProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useRealtimeSearch, setUseRealtimeSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported,
    error: speechError,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (speechError) {
      toast({ title: "Speech Recognition Error", description: speechError, variant: "destructive" });
    }
  }, [speechError, toast]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Image too large", description: "Please select an image smaller than 5MB.", variant: "destructive"});
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !imageFile) return;
    onSendMessage(text, { imageFile: imageFile || undefined, useRealtimeSearch });
    setText('');
    handleRemoveImage(); // Clear image after sending
    if (isListening) {
      stopListening();
    }
    // After sending, turn off the search toggle if it was on
    if (useRealtimeSearch) {
      setUseRealtimeSearch(false);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      toast({ title: "Speech Recognition Not Supported", description: "Your browser does not support speech recognition.", variant: "destructive"});
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="w-full">
          {imagePreview && (
            <div className="mb-2 relative w-24 h-24 rounded-md overflow-hidden border">
              <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" data-ai-hint="image preview"/>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
                onClick={handleRemoveImage}
                type="button"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex w-full items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5">
            {/* Left Icons Group */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isLoading} 
                    aria-label="Attach image"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Attach Image</p></TooltipContent>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={onOpenCamera} 
                    disabled={isLoading} 
                    aria-label="Open camera"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Use Camera</p></TooltipContent>
              </Tooltip>
            </div>

            {/* Textarea */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Omni..."}
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 p-0 self-center min-h-[24px] max-h-[120px] text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />

            {/* Right Icons Group */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant={isListening ? "destructive" : "ghost"} 
                    size="icon" 
                    onClick={toggleListening} 
                    disabled={isLoading || !speechSupported}
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isListening ? "Stop Listening" : (speechSupported ? "Voice Input" : "Voice Not Supported")}</p></TooltipContent>
              </Tooltip>
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || (!text.trim() && !imageFile)} 
                aria-label="Send message"
                className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-transform duration-150 ease-in-out hover:scale-110 active:scale-100"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </form>
         <div className="flex items-center justify-center sm:justify-end space-x-2 pt-1 pr-2">
            <Label htmlFor="realtime-search" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </Label>
            <Switch id="realtime-search" checked={useRealtimeSearch} onCheckedChange={setUseRealtimeSearch} disabled={isLoading} />
          </div>
      </div>
    </TooltipProvider>
  );
}
