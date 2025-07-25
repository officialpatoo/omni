
"use client";

import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, Camera, XCircle, Loader2, Search, RefreshCcw, Languages, Expand, PlusCircle, Image as ImageIcon, Pencil } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface InputAreaProps {
  onSendMessage: (text: string, options: { imageFile?: File, useRealtimeSearch?: boolean, mode?: 'chat' | 'imagine' | 'edit' }) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
  onInputAction: (currentText: string, action: 'rephrase' | 'translate' | 'expand') => Promise<string>;
}

export function InputArea({ onSendMessage, isLoading, onOpenCamera, onInputAction }: InputAreaProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useRealtimeSearch, setUseRealtimeSearch] = useState(false);
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'imagine' | 'edit'>('chat');
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
  
  useEffect(() => {
    if (!imageFile) {
      setMode('chat');
    }
  }, [imageFile]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Image too large", description: "Please select an image smaller than 5MB.", variant: "destructive"});
        return;
      }
      setImageFile(file);
      setMode('chat'); // Default to chat mode when image is uploaded
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
    if (isLoading || isInputLoading) return;
    if (!text.trim() && !imageFile && mode !== 'imagine') return;
    onSendMessage(text, { imageFile: imageFile || undefined, useRealtimeSearch, mode });
    setText('');
    handleRemoveImage(); // Clear image after sending
    setMode('chat'); // Reset mode
    if (isListening) {
      stopListening();
    }
    // After sending, turn off the search toggle if it was on
    if (useRealtimeSearch) {
      setUseRealtimeSearch(false);
    }
  };

  const handleActionButtonClick = async (action: 'rephrase' | 'translate' | 'expand') => {
    setIsInputLoading(true);
    const newText = await onInputAction(text, action);
    setText(newText);
    setIsInputLoading(false);
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
  
  const handleImagineClick = () => {
    setMode('imagine');
    handleRemoveImage();
    toast({ title: "Imagine Mode", description: "Type a prompt to generate an image."});
  }
  
  const handleEditClick = () => {
    setMode('edit');
    toast({ title: "Edit Mode", description: "Describe the changes you want to make to the image."});
  }


  const anyLoading = isLoading || isInputLoading;
  
  const getPlaceholderText = () => {
    if (isListening) return "Listening...";
    switch(mode) {
      case 'imagine': return "Describe the image you want to create...";
      case 'edit': return "Describe the edits for the image...";
      default: return "Type your message to Omni...";
    }
  }

  const showSendButton = !anyLoading && (!!text.trim() || !!imageFile || (mode === 'imagine' && !!text.trim()));

  return (
    <TooltipProvider>
       <div 
        className="w-full flex flex-col gap-2 p-2 rounded-3xl border bg-input-area-background text-input-area-foreground"
      >
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
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
            <div className="flex w-full items-start gap-2">
                 <div 
                    className="flex-1 flex items-start gap-2 rounded-2xl border bg-background px-3 py-2"
                 >
                    {/* Left Icons Group */}
                    <div className="flex items-center gap-1 pt-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={anyLoading}
                                    aria-label="Attach file or use camera"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    <span>Attach Image</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onOpenCamera}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    <span>Use Camera</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleImagineClick}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    <span>Imagine</span>
                                </DropdownMenuItem>
                                {imageFile && (
                                    <DropdownMenuItem onClick={handleEditClick}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit Image</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={anyLoading}
                        />
                    </div>

                    {/* Textarea */}
                    <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={getPlaceholderText()}
                    className="flex-1 resize-none bg-transparent border-0 focus:ring-0 p-0 self-center min-h-[28px] max-h-[120px] text-base"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                        }
                    }}
                    disabled={anyLoading}
                    />

                    {/* Right Icons Group */}
                    <div className="flex items-center gap-1 pt-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button 
                            type="button" 
                            variant={isListening ? "secondary" : "ghost"} 
                            size="icon" 
                            onClick={toggleListening} 
                            disabled={anyLoading || !speechSupported}
                            aria-label={isListening ? "Stop listening" : "Start voice input"}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isListening ? "Stop Listening" : (speechSupported ? "Voice Input" : "Voice Not Supported")}</p></TooltipContent>
                    </Tooltip>
                     <Button 
                        type="submit" 
                        variant="ghost"
                        size="icon" 
                        disabled={anyLoading || (!text.trim() && !imageFile && mode !== 'imagine')} 
                        aria-label="Send message"
                        className={cn(
                            "h-7 w-7 text-muted-foreground hover:text-foreground",
                            showSendButton ? "opacity-100" : "opacity-0"
                        )}
                    >
                         {anyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {mode === 'chat' && (
                    <>
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleActionButtonClick('rephrase')} disabled={anyLoading || !text.trim()}><RefreshCcw className="mr-1 h-3 w-3" /> Rephrase</Button>
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleActionButtonClick('translate')} disabled={anyLoading || !text.trim()}><Languages className="mr-1 h-3 w-3" /> Translate</Button>
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleActionButtonClick('expand')} disabled={anyLoading || !text.trim()}><Expand className="mr-1 h-3 w-3" /> Expand</Button>
                    </>
                )}
                 {imageFile && mode !== 'edit' && (
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={handleEditClick} disabled={anyLoading}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit Image
                  </Button>
                )}
                 {mode === 'imagine' && (
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMode('chat')} disabled={anyLoading}>
                    Cancel Imagine
                  </Button>
                )}
                {mode === 'edit' && (
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMode('chat')} disabled={anyLoading}>
                    Cancel Edit
                  </Button>
                )}
            </div>
        </form>
         <div className="flex items-center justify-center sm:justify-end space-x-2 -mt-2 -mr-1">
            <Label htmlFor="realtime-search" className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </Label>
            <Switch id="realtime-search" checked={useRealtimeSearch} onCheckedChange={setUseRealtimeSearch} disabled={anyLoading} />
          </div>
      </div>
    </TooltipProvider>
  );
}
