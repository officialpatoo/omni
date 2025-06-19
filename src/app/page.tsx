
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
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const LOCAL_STORAGE_CHAT_HISTORY_KEY_PREFIX = 'patooworld_chat_history_';
const LOCAL_STORAGE_CURRENT_CHAT_ID_KEY_PREFIX = 'patooworld_current_chat_id_';

export default function HomePage() {
  const { user, isLoading: isLoadingAuth, signOut } = useAuth();
  const router = useRouter();

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const { toast } = useToast();

  const [editingSessionDetails, setEditingSessionDetails] = useState<{ id: string; currentTitle: string } | null>(null);

  const getChatHistoryKey = useCallback(() => user ? `${LOCAL_STORAGE_CHAT_HISTORY_KEY_PREFIX}${user.uid}` : null, [user]);
  const getCurrentChatIdKey = useCallback(() => user ? `${LOCAL_STORAGE_CURRENT_CHAT_ID_KEY_PREFIX}${user.uid}` : null, [user]);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoadingAuth, router]);

  useEffect(() => {
    if (user) {
      const chatHistoryKey = getChatHistoryKey();
      const currentChatIdKey = getCurrentChatIdKey();

      if (!chatHistoryKey || !currentChatIdKey) return;

      const storedHistory = localStorage.getItem(chatHistoryKey);
      const storedChatId = localStorage.getItem(currentChatIdKey);
      let activeChatId = storedChatId;
      let initialChatHistory: ChatSession[] = [];

      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory) as any[];
          initialChatHistory = parsedHistory.map(session => ({
            ...session,
            messages: session.messages.map((message: any) => ({
              ...message,
              timestamp: new Date(message.timestamp), 
            })),
            createdAt: new Date(session.createdAt),
            lastUpdated: new Date(session.lastUpdated),
          }));
          setChatHistory(initialChatHistory);
          if (!activeChatId && initialChatHistory.length > 0) {
            activeChatId = initialChatHistory[0].id;
          }
        } catch (error) {
          console.error("Error parsing chat history from localStorage", error);
          localStorage.removeItem(chatHistoryKey); 
        }
      }

      if (activeChatId) {
        setCurrentChatId(activeChatId);
        const currentSession = initialChatHistory.find(s => s.id === activeChatId);
        if (currentSession) {
          setMessages(currentSession.messages);
        } else if (initialChatHistory.length === 0) {
          startNewChat();
        }
      } else {
        startNewChat();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, getChatHistoryKey, getCurrentChatIdKey]);

  useEffect(() => {
    const chatHistoryKey = getChatHistoryKey();
    if (user && chatHistoryKey) {
      if (chatHistory.length > 0) {
        localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
      } else {
        const storedHistory = localStorage.getItem(chatHistoryKey);
        if (storedHistory) {
          localStorage.removeItem(chatHistoryKey);
        }
      }
    }
  }, [chatHistory, user, getChatHistoryKey]);
  
  useEffect(() => {
    const currentChatIdKey = getCurrentChatIdKey();
    if (user && currentChatIdKey) {
      if (currentChatId) {
        localStorage.setItem(currentChatIdKey, currentChatId);
        const currentSession = chatHistory.find(s => s.id === currentChatId);
        if (currentSession) {
          setMessages(currentSession.messages);
        }
      } else {
         localStorage.removeItem(currentChatIdKey);
      }
    }
  }, [currentChatId, chatHistory, user, getCurrentChatIdKey]);


  const addMessageToCurrentChat = (message: Omit<Message, 'id' | 'timestamp'>): string => {
    const newMessageId = uuidv4();
    const newMessage: Message = { ...message, id: newMessageId, timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    setChatHistory((prevHistory) =>
      prevHistory.map((session) =>
        session.id === currentChatId
          ? { ...session, messages: [...session.messages, newMessage], lastUpdated: new Date() }
          : session
      ).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    );
    return newMessageId;
  };

  const updateMessageInCurrentChat = (messageId: string, update: Partial<Message>) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...update } : msg
      )
    );
    setChatHistory((prevHistory) =>
      prevHistory.map((session) => {
        if (session.id === currentChatId) {
          const updatedMessages = session.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...update } : msg
          );
          return { ...session, messages: updatedMessages, lastUpdated: new Date() };
        }
        return session;
      }).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
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
    
    const assistantMessageId = addMessageToCurrentChat({ role: 'assistant', text: '', isLoading: true });
    
    try {
      if (imageUrl) { // Image analysis
        const aiResponse = await analyzeImageQuery({ photoDataUri: imageUrl, query: text || "Describe this image." });
        updateMessageInCurrentChat(assistantMessageId, { text: aiResponse.answer, isLoading: false });
      } else { // Text generation
        const aiResponse = await generateContentFromQuery({ query: text });
        updateMessageInCurrentChat(assistantMessageId, { text: aiResponse.content, isLoading: false });
      }
    } catch (error) {
      console.error('AI Error:', error);
      let errorMessage = "Sorry, something went wrong.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateMessageInCurrentChat(assistantMessageId, { text: '', error: errorMessage, isLoading: false });
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
    const assistantMessageId = addMessageToCurrentChat({ role: 'assistant', text: '', isLoading: true });

    try {
      const queryText = "What do you see in this image?"; 
      const aiResponse = await analyzeImageQuery({ photoDataUri: imageDataUri, query: queryText });
      updateMessageInCurrentChat(assistantMessageId, { text: aiResponse.answer, isLoading: false });
    } catch (error) {
      console.error('AI Camera Error:', error);
      let errorMessage = "Sorry, something went wrong with camera image analysis.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateMessageInCurrentChat(assistantMessageId, { text: '', error: errorMessage, isLoading: false });
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId, toast]);

  const startNewChat = () => {
    if (!user) return; 
    const newSessionId = uuidv4();
    const newSessionTitle = `Chat ${chatHistory.length + 1}`; 
    const newSession: ChatSession = {
      id: newSessionId,
      title: newSessionTitle,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    
    setChatHistory((prev) => 
      [newSession, ...prev.filter(s => s.id !== newSessionId)]
      .sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    );
    setCurrentChatId(newSessionId);
    setMessages([]); 
    setEditingSessionDetails({ id: newSessionId, currentTitle: newSessionTitle });
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
    const selectedSession = chatHistory.find(s => s.id === id);
    if (selectedSession) {
      setMessages(selectedSession.messages);
    }
    setEditingSessionDetails(null); 
  };

  const deleteChat = (id: string) => {
    setChatHistory((prev) => {
      const updatedHistory = prev.filter(s => s.id !== id);
      if (currentChatId === id) {
        if (updatedHistory.length > 0) {
          const sortedHistory = [...updatedHistory].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          selectChat(sortedHistory[0].id);
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
      const sessionToRevert = chatHistory.find(s => s.id === id);
      setEditingSessionDetails({id, currentTitle: sessionToRevert?.title || `Chat ${id.substring(0,8)}` });
      return;
    }
    setChatHistory(prev => 
      prev.map(session => 
        session.id === id ? { ...session, title: newTitle.trim(), lastUpdated: new Date() } : session
      ).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    );
    setEditingSessionDetails(null);
  };

  const handleCancelEditChatSession = () => {
    setEditingSessionDetails(null);
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
        user={user}
        onSignOut={signOut}
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
