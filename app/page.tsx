
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Message, ChatSession, AiAction } from '@/types';
import { analyzeImageQuery } from '@/ai/flows/analyze-image-query';
import { invokeOmniChat } from '@/ai/flows/omni-chat-flow';
import { generateImage } from '@/ai/flows/generate-image';
import { editImage } from '@/ai/flows/edit-image';
import { rephraseText } from '@/ai/flows/rephrase-text';
import { translateText } from '@/ai/flows/translate-text';
import { expandIdea } from '@/ai/flows/expand-idea';
import { improvePrompt } from '@/ai/flows/improve-prompt';
import { textToSpeech } from '@/ai/flows/text-to-speech';

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
import { Logo } from '@/components/logo';

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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { toast } = useToast();

  const [editingSessionDetails, setEditingSessionDetails] = useState<{ id: string; currentTitle: string } | null>(null);

  const [audioState, setAudioState] = useState<{
    playingMessageId: string | null;
    loadingMessageId: string | null;
    audio: HTMLAudioElement | null;
  }>({
    playingMessageId: null,
    loadingMessageId: null,
    audio: null,
  });

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

  const handleStopPlayback = useCallback(() => {
    if (audioState.audio) {
      audioState.audio.pause();
    }
    setAudioState({ playingMessageId: null, loadingMessageId: null, audio: null });
  }, [audioState.audio]);


  const handleSendMessage = useCallback(async (text: string, options: { imageFile?: File, useRealtimeSearch?: boolean, mode?: 'chat' | 'imagine' | 'edit' }) => {
    const { imageFile, useRealtimeSearch, mode = 'chat' } = options;
    
    if (!currentChatId) {
      toast({ title: "Error", description: "No active chat session.", variant: "destructive" });
      return;
    }
    handleStopPlayback();
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
      if (mode === 'imagine') {
        const imagePrompt = text.trim();
         if (!imagePrompt) {
            updateMessageInCurrentChat(assistantMessageId, { text: 'Please provide a description for the image you want to generate.', error: "Empty prompt.", isLoading: false });
            setIsAiLoading(false);
            return;
        }
        updateMessageInCurrentChat(assistantMessageId, { text: `Generating an image of: "${imagePrompt}"...`, isLoading: true });
        const aiResponse = await generateImage({ prompt: imagePrompt });
        updateMessageInCurrentChat(assistantMessageId, {
            text: `Here's your image of "${imagePrompt}":`,
            imageUrl: aiResponse.imageDataUri,
            isLoading: false,
        });

      } else if (mode === 'edit' && imageUrl) {
         const editPrompt = text.trim();
         if (!editPrompt) {
            updateMessageInCurrentChat(assistantMessageId, { text: 'Please provide a description of the edits you want to make.', error: "Empty prompt.", isLoading: false });
            setIsAiLoading(false);
            return;
        }
        updateMessageInCurrentChat(assistantMessageId, { text: `Editing image with prompt: "${editPrompt}"...`, isLoading: true });
        const aiResponse = await editImage({ imageDataUri: imageUrl, prompt: editPrompt });
        updateMessageInCurrentChat(assistantMessageId, {
            text: `Here's the edited image:`,
            imageUrl: aiResponse.imageDataUri,
            isLoading: false,
        });

      } else if (imageUrl && mode === 'chat') { // Image analysis
        const aiResponse = await analyzeImageQuery({ photoDataUri: imageUrl, query: text || "Describe this image." });
        updateMessageInCurrentChat(assistantMessageId, { text: aiResponse.answer, isLoading: false });
      
      } else { // Text generation
        const aiResponse = await invokeOmniChat({ prompt: text, useRealtimeSearch });
        updateMessageInCurrentChat(assistantMessageId, { 
            text: aiResponse.responseText, 
            suggestions: aiResponse.suggestions,
            isLoading: false 
        });
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
  }, [currentChatId, toast, handleStopPlayback]);

  const handleCameraCapture = useCallback(async (imageDataUri: string) => {
    if (!currentChatId) {
      toast({ title: "Error", description: "No active chat session.", variant: "destructive" });
      return;
    }
    handleStopPlayback();
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
  }, [currentChatId, toast, handleStopPlayback]);

  const handleAiAction = useCallback(async (messageId: string, action: AiAction, context: any) => {
    handleStopPlayback();
    if (isAiLoading) {
      toast({ title: "AI is busy", description: "Please wait for the current response to finish.", variant: "default" });
      return;
    }
    
    if (action === 'send_suggestion') {
      await handleSendMessage(context.suggestion, { useRealtimeSearch: false });
      return;
    }
    
    const aiMessageIndex = messages.findIndex(m => m.id === messageId);
    const aiMessage = messages[aiMessageIndex];

    if (!aiMessage) {
      toast({ title: "Error", description: "Original message not found.", variant: "destructive" });
      return;
    }

    if (action === 'read_aloud') {
      if (audioState.playingMessageId === messageId) {
        handleStopPlayback();
        return;
      }
      
      setAudioState({ ...audioState, loadingMessageId: messageId });
      try {
        const response = await textToSpeech({ text: aiMessage.text });
        const audio = new Audio(response.audioDataUri);
        audio.onended = handleStopPlayback;
        audio.play();
        setAudioState({ playingMessageId: messageId, loadingMessageId: null, audio });
      } catch (error) {
        console.error(`AI Action Error (read_aloud):`, error);
        toast({ title: "Read Aloud Error", description: "Failed to generate audio.", variant: "destructive" });
        setAudioState({ playingMessageId: null, loadingMessageId: null, audio: null });
      }
      return;
    }
    
    setIsAiLoading(true);
    const assistantMessageId = addMessageToCurrentChat({ role: 'assistant', text: '', isLoading: true });

    try {
      let aiResponseText = '';
      switch (action) {
        case 'rephrase':
          const rephraseResult = await rephraseText({ text: aiMessage.text, style: context.style });
          aiResponseText = `**Rephrased (${context.style}):**\n\n${rephraseResult.rephrasedText}`;
          break;
        case 'translate':
          const translateResult = await translateText({ text: aiMessage.text, language: context.language });
          aiResponseText = `**Translated (Spanish):**\n\n${translateResult.translatedText}`;
          break;
        case 'expand':
          const expandResult = await expandIdea({ text: aiMessage.text });
          aiResponseText = `**Expanded Idea:**\n\n${expandResult.expandedText}`;
          break;
        case 'improve_prompt':
          const userMessage = messages[aiMessageIndex - 1];
          if (userMessage && userMessage.role === 'user') {
            const improveResult = await improvePrompt({ originalPrompt: userMessage.text, aiResponse: aiMessage.text });
            aiResponseText = `**Prompt Suggestion:**\n\n${improveResult.improvedPrompt}`;
          } else {
            throw new Error("Could not find the original user prompt for this response.");
          }
          break;
      }
      updateMessageInCurrentChat(assistantMessageId, { text: aiResponseText, isLoading: false });
    } catch (error) {
       console.error(`AI Action Error (${action}):`, error);
      let errorMessage = "Sorry, something went wrong with that action.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateMessageInCurrentChat(assistantMessageId, { text: '', error: errorMessage, isLoading: false });
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiLoading, messages, toast, handleStopPlayback, audioState, handleSendMessage]);

  const handleInputAction = useCallback(async (currentText: string, action: 'rephrase' | 'translate' | 'expand'): Promise<string> => {
      if (isAiLoading) {
        toast({ title: "AI is busy", description: "Please wait for the current response to finish." });
        return currentText;
      }
      if (!currentText.trim()) {
        toast({ title: "Input is empty", description: "Please type a message first.", variant: "destructive" });
        return currentText;
      }

      setIsAiLoading(true);

      try {
        let resultText = '';
        switch(action) {
          case 'rephrase':
            // For simplicity, we'll just use 'simpler' style here. This could be a dropdown in the future.
            const rephraseResult = await rephraseText({ text: currentText, style: 'simpler' });
            resultText = rephraseResult.rephrasedText;
            break;
          case 'translate':
            // Translating to Spanish as an example.
            const translateResult = await translateText({ text: currentText, language: 'Spanish' });
            resultText = translateResult.translatedText;
            break;
          case 'expand':
            const expandResult = await expandIdea({ text: currentText });
            resultText = expandResult.expandedText;
            break;
        }
        return resultText;
      } catch (error) {
        console.error(`Input Action Error (${action}):`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Action Failed", description: errorMessage, variant: "destructive" });
        return currentText; // Return original text on error
      } finally {
        setIsAiLoading(false);
      }
  }, [isAiLoading, toast]);


  const startNewChat = () => {
    if (!user) return; 
    handleStopPlayback();
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
    handleStopPlayback();
    setCurrentChatId(id);
    const selectedSession = chatHistory.find(s => s.id === id);
    if (selectedSession) {
      setMessages(selectedSession.messages);
    }
    setEditingSessionDetails(null); 
  };

  const deleteChat = (id: string) => {
    handleStopPlayback();
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

  const disclaimer = (
    <div className="px-4 pb-2 text-center text-xs text-muted-foreground">
      <p>
        Omni is powered by Google Gemini API, and can sometimes make mistakes. Consider checking important information.
      </p>
    </div>
  );

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
      <div className="flex h-screen flex-1 flex-col">
        <PageHeader isVisible={isHeaderVisible} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center overflow-auto">
            <div className="w-full max-w-6xl flex-1 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                  <Logo width={180} height={160} priority />
                </div>
              ) : (
                <ChatInterface 
                  messages={messages} 
                  onAction={handleAiAction} 
                  audioState={audioState} 
                  onStopPlayback={handleStopPlayback}
                  onScroll={(isScrollingDown) => setIsHeaderVisible(!isScrollingDown)}
                />
              )}
            </div>
          </div>
          <div className="flex justify-center bg-background">
          <div className="w-full max-w-2xl">
              <InputArea
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
                onOpenCamera={() => setIsCameraModalOpen(true)}
                onInputAction={handleInputAction}
              />
               {disclaimer}
            </div>
          </div>
        </main>
      </div>
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </SidebarProvider>
  );
}
