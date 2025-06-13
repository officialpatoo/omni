"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/types';
import { analyzeImageQuery } from '@/ai/flows/analyze-image-query';
import { generateContentFromQuery } from '@/ai/flows/generate-content-from-query';

import { ChatInterface } from '@/components/chat-interface';
import { InputArea } from '@/components/input-area';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { CameraCaptureModal } from '@/components/camera-capture-modal';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs


// Helper to convert File to Data URI
async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const { toast } = useToast();

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...message, id: uuidv4(), timestamp: new Date() }]);
  };

  const updateLastMessage = (update: Partial<Message>) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...update };
      }
      return newMessages;
    });
  };

  const handleSendMessage = useCallback(async (text: string, imageFile?: File) => {
    setIsLoading(true);
    const userMessageText = text || (imageFile ? "Image attached" : "Empty message");

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await fileToDataUri(imageFile);
        addMessage({ role: 'user', text: userMessageText, imageUrl });
      } catch (error) {
        console.error("Error converting file to data URI:", error);
        toast({ title: "Image Upload Error", description: "Could not process the image.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else {
      addMessage({ role: 'user', text: userMessageText });
    }
    
    addMessage({ role: 'assistant', text: '', isLoading: true }); // Placeholder for AI response

    try {
      let aiResponseText: string;
      if (imageUrl) { // If there's an image, always use analyzeImageQuery
        const aiResponse = await analyzeImageQuery({ photoDataUri: imageUrl, query: text || "Describe this image." });
        aiResponseText = aiResponse.answer;
      } else { // Text-only query
        const aiResponse = await generateContentFromQuery({ query: text });
        aiResponseText = aiResponse.content;
      }
      updateLastMessage({ text: aiResponseText, isLoading: false });
    } catch (error) {
      console.error('AI Error:', error);
      let errorMessage = "Sorry, something went wrong.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateLastMessage({ text: '', error: errorMessage, isLoading: false });
      toast({
        title: "AI Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  const handleCameraCapture = useCallback(async (imageDataUri: string) => {
    setIsCameraModalOpen(false); // Close modal first
    setIsLoading(true);

    addMessage({ role: 'user', text: "Image captured from camera", imageUrl: imageDataUri });
    addMessage({ role: 'assistant', text: '', isLoading: true });

    try {
      // For now, let's assume a generic query for camera captures.
      // A more sophisticated approach might allow user to type a query *after* capture but before sending.
      const queryText = "What do you see in this image?"; 
      const aiResponse = await analyzeImageQuery({ photoDataUri: imageDataUri, query: queryText });
      updateLastMessage({ text: aiResponse.answer, isLoading: false });
    } catch (error) {
      console.error('AI Camera Error:', error);
      let errorMessage = "Sorry, something went wrong with camera image analysis.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateLastMessage({ text: '', error: errorMessage, isLoading: false });
      toast({
        title: "AI Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Install uuid if not already: npm install uuid && npm install @types/uuid -D
  // If not using uuid, a simpler id like Date.now().toString() + Math.random().toString() can be used for client-side only demo.
  // For this example, ensuring uuid is available. If `package.json` needs update, I cannot do it.
  // Assuming uuid is available for unique IDs.

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex items-center justify-between shadow-sm">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface messages={messages} />
      </main>
      <InputArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onOpenCamera={() => setIsCameraModalOpen(true)}
      />
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
