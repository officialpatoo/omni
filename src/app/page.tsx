
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ChatSession } from '@/types';
import { analyzeImageQuery } from '@/ai/flows/analyze-image-query';
import { generateContentFromQuery } from '@/ai/flows/generate-content-from-query';

import { ChatInterface } from '@/components/chat-interface';
import { InputArea } from '@/components/input-area';
import { CameraCaptureModal } from '@/components/camera-capture-modal';
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from '@/components/app-sidebar';
import { PageHeader } from '@/components/page-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { v4 as uuidv4 } from 'uuid';

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const LOCAL_STORAGE_CHAT_HISTORY_KEY = 'patoovision_chat_history';
const LOCAL_STORAGE_CURRENT_CHAT_ID_KEY = 'patoovision_current_chat_id';

export default function HomePage() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const { toast } = useToast();

  const [editingSessionDetails, setEditingSessionDetails] = useState<{ id: string; currentTitle: string } | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
    const storedChatId = localStorage.getItem(LOCAL_STORAGE_CURRENT_CHAT_ID_KEY);
    let activeChatId = storedChatId;

    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory) as ChatSession[];
      setChatHistory(parsedHistory);
      if (!activeChatId && parsedHistory.length > 0) {
        activeChatId = parsedHistory[0].id;
      }
    }

    if (activeChatId) {
      setCurrentChatId(activeChatId);
      const currentSession = (JSON.parse(storedHistory || '[]') as ChatSession[]).find(s => s.id === activeChatId);
      if (currentSession) {
        setMessages(currentSession.messages);
      } else if (JSON.parse(storedHistory || '[]').length === 0) {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } else {
      // If chat history becomes empty, remove it from localStorage
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
      if (storedHistory) {
        localStorage.removeItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
      }
    }
  }, [chatHistory]);
  
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_CHAT_ID_KEY, currentChatId);
      const currentSession = chatHistory.find(s => s.id === currentChatId);
      if (currentSession) {
        setMessages(currentSession.messages);
      }
    } else {
       localStorage.removeItem(LOCAL_STORAGE_CURRENT_CHAT_ID_KEY);
    }
  }, [currentChatId, chatHistory]);


  const addMessageToCurrentChat = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = { ...message, id: uuidv4(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    setChatHistory((prevHistory) =>
      prevHistory.map((session) =>
        session.id === currentChatId
          ? { ...session, messages: [...session.messages, newMessage], lastUpdated: new Date() }
          : session
      )
    );
  };

  const updateLastMessageInCurrentChat = (update: Partial<Message>) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...update };
      }
      return newMessages;
    });
    setChatHistory((prevHistory) =>
      prevHistory.map((session) => {
        if (session.id === currentChatId && session.messages.length > 0) {
          const updatedMessages = [...session.messages];
          updatedMessages[updatedMessages.length - 1] = { ...updatedMessages[updatedMessages.length - 1], ...update };
          return { ...session, messages: updatedMessages, lastUpdated: new Date() };
        }
        return session;
      })
    );
  };

  const handleSendMessage = useCallback(async (text: string, imageFile?: File) => {
    if (!currentChatId) {
      toast({ title: "Error", description: "No active chat session.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    const userMessageText = text || (imageFile ? "Image attached" : "Empty message");

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await fileToDataUri(imageFile);
        addMessageToCurrentChat({ role: 'user', text: userMessageText, imageUrl });
      } catch (error) {
        console.error("Error converting file to data URI:", error);
        toast({ title: "Image Upload Error", description: "Could not process the image.", variant: "destructive" });
        setIsAiLoading(false);
        return;
      }
    } else {
      addMessageToCurrentChat({ role: 'user', text: userMessageText });
    }
    
    addMessageToCurrentChat({ role: 'assistant', text: '', isLoading: true });

    try {
      let aiResponseText: string;
      if (imageUrl) {
        const aiResponse = await analyzeImageQuery({ photoDataUri: imageUrl, query: text || "Describe this image." });
        aiResponseText = aiResponse.answer;
      } else {
        const aiResponse = await generateContentFromQuery({ query: text });
        aiResponseText = aiResponse.content;
      }
      updateLastMessageInCurrentChat({ text: aiResponseText, isLoading: false });
    } catch (error) {
      console.error('AI Error:', error);
      let errorMessage = "Sorry, something went wrong.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateLastMessageInCurrentChat({ text: '', error: errorMessage, isLoading: false });
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId, toast]);

  const handleCameraCapture = useCallback(async (imageDataUri: string) => {
    if (!currentChatId) {
      toast({ title: "Error", description: "No active chat session.", variant: "destructive" });
      return;
    }
    setIsCameraModalOpen(false);
    setIsAiLoading(true);

    addMessageToCurrentChat({ role: 'user', text: "Image captured from camera", imageUrl: imageDataUri });
    addMessageToCurrentChat({ role: 'assistant', text: '', isLoading: true });

    try {
      const queryText = "What do you see in this image?"; 
      const aiResponse = await analyzeImageQuery({ photoDataUri: imageDataUri, query: queryText });
      updateLastMessageInCurrentChat({ text: aiResponse.answer, isLoading: false });
    } catch (error) {
      console.error('AI Camera Error:', error);
      let errorMessage = "Sorry, something went wrong with camera image analysis.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateLastMessageInCurrentChat({ text: '', error: errorMessage, isLoading: false });
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId, toast]);

  const startNewChat = () => {
    const newSessionId = uuidv4();
    const newSessionTitle = `Chat ${chatHistory.length + 1}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: newSessionTitle,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    // Add to the beginning of the array so it appears at the top
    setChatHistory((prev) => [newSession, ...prev.filter(s => s.id !== newSessionId)]);
    setCurrentChatId(newSessionId);
    setMessages([]); // Clear messages for the new chat
     // Automatically start editing the title of the new chat
    setEditingSessionDetails({ id: newSessionId, currentTitle: newSessionTitle });
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
    const selectedSession = chatHistory.find(s => s.id === id);
    if (selectedSession) {
      setMessages(selectedSession.messages);
    }
    setEditingSessionDetails(null); // Cancel any ongoing edit when switching chats
  };

  const deleteChat = (id: string) => {
    setChatHistory((prev) => {
      const updatedHistory = prev.filter(s => s.id !== id);
      if (currentChatId === id) {
        if (updatedHistory.length > 0) {
          selectChat(updatedHistory[0].id);
        } else {
          startNewChat();
        }
      }
      return updatedHistory;
    });
     if (editingSessionDetails?.id === id) {
      setEditingSessionDetails(null);
    }
  };

  const handleStartEditChatSession = (id: string, currentTitle: string) => {
    setEditingSessionDetails({ id, currentTitle });
  };

  const handleSaveChatSessionTitle = (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({ title: "Invalid Title", description: "Chat title cannot be empty.", variant: "destructive" });
      // Optionally, revert to old title or a default
      const sessionToRevert = chatHistory.find(s => s.id === id);
      setEditingSessionDetails({id, currentTitle: sessionToRevert?.title || `Chat ${id.substring(0,8)}` });
      return;
    }
    setChatHistory(prev => 
      prev.map(session => 
        session.id === id ? { ...session, title: newTitle.trim(), lastUpdated: new Date() } : session
      )
    );
    setEditingSessionDetails(null);
  };

  const handleCancelEditChatSession = () => {
    setEditingSessionDetails(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        editingSessionDetails={editingSessionDetails}
        onStartEditChatSession={handleStartEditChatSession}
        onSaveChatSessionTitle={handleSaveChatSessionTitle}
        onCancelEditChatSession={handleCancelEditChatSession}
      />
      <div className="flex flex-col h-screen flex-1">
        <PageHeader />
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <ChatInterface messages={messages} />
        </main>
        <div className="flex justify-center bg-background">
            <div className="w-full max-w-2xl px-2 pb-2">
                 <InputArea
                    onSendMessage={handleSendMessage}
                    isLoading={isAiLoading}
                    onOpenCamera={() => setIsCameraModalOpen(true)}
                  />
            </div>
        </div>
      </div>
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </SidebarProvider>
  );
}

    