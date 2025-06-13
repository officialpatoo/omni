"use client";

import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, Camera, XCircle, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


interface InputAreaProps {
  onSendMessage: (text: string, image?: File) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
}

export function InputArea({ onSendMessage, isLoading, onOpenCamera }: InputAreaProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    onSendMessage(text, imageFile || undefined);
    setText('');
    handleRemoveImage(); // Clear image after sending
    if (isListening) {
      stopListening();
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
    <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
      {imagePreview && (
        <div className="mb-2 relative w-32 h-32 rounded-md overflow-hidden border">
          <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" data-ai-hint="image preview"/>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={handleRemoveImage}
            type="button"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-start gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your message or ask about an image..."}
          className="flex-1 resize-none min-h-[40px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="Attach image">
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
            <Button type="button" variant="ghost" size="icon" onClick={onOpenCamera} disabled={isLoading} aria-label="Open camera">
              <Camera className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Use Camera</p></TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button" 
              variant={isListening ? "destructive" : "ghost"} 
              size="icon" 
              onClick={toggleListening} 
              disabled={isLoading || !speechSupported}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{isListening ? "Stop Listening" : (speechSupported ? "Voice Input" : "Voice Not Supported")}</p></TooltipContent>
        </Tooltip>
        <Button type="submit" size="icon" disabled={isLoading || (!text.trim() && !imageFile)} aria-label="Send message">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
    </TooltipProvider>
  );
}
