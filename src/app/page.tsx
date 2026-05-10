"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, query, orderBy, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getAiContextualReply } from "@/ai/flows/ai-contextual-memory-flow";
import { adaptPersona } from "@/ai/flows/ai-adaptive-persona-flow";
import { Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { BharatmaanLogo } from "@/components/brand/logo";

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  persona?: string;
};

export default function BharatmaanChat() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSplash, setIsSplash] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const PRIVATE_SERVER_URL = 'https://ef84d6f6-5ad3-47ea-8889-16507c6e1c80-00-2ulk7xi0bas6p.pike.replit.dev/chat';

  // Splash screen logic
  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth');
    }
  }, [user, userLoading, router]);

  // Wake up private server
  useEffect(() => {
    if (user) {
      fetch(PRIVATE_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Server Wakeup Call", task: "ping" }),
      }).catch(() => {});
    }
  }, [user]);

  // Fetch Messages for active session with memoized query
  const messagesQuery = useMemoFirebase(() => {
    if (!activeSessionId || !user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, user, activeSessionId]);
  
  const { data: messages = [] } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!user || !db) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSessionRef = doc(collection(db, 'users', user.uid, 'sessions'));
      sessionId = newSessionRef.id;
      setDoc(newSessionRef, {
        id: sessionId,
        title: content.slice(0, 30) + '...',
        updatedAt: Date.now()
      });
      setActiveSessionId(sessionId);
    }

    const messageRef = collection(db, 'users', user.uid, 'sessions', sessionId, 'messages');
    
    const userMsgData = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    addDoc(messageRef, userMsgData);
    setIsTyping(true);

    try {
      const chatHistory = messages.slice(-5).map(m => m.content as string);
      const personaData = await adaptPersona({
        userMessage: content,
        chatHistory
      });

      const aiReply = await getAiContextualReply({
        message: content,
        history: [...messages, userMsgData].map(m => ({
          role: m.role as any,
          content: m.content as string
        }))
      });

      addDoc(messageRef, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiReply.reply,
        timestamp: Date.now(),
        persona: personaData.detectedPersona
      });

      setDoc(doc(db, 'users', user.uid, 'sessions', sessionId), {
        updatedAt: Date.now()
      }, { merge: true });

    } catch (error) {
      toast({
        title: "Communication Error",
        description: "Bharatmaan AI is having trouble connecting to your private server.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!activeSessionId || !user || !db) return;
    const sessionMessages = await getDocs(collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages'));
    sessionMessages.forEach(async (m) => {
      deleteDoc(doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', m.id));
    });
    toast({ description: "Chat history cleared." });
  };

  if (isSplash || userLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 animate-in fade-in duration-700">
        <div className="w-32 h-32 rounded-[2.5rem] bg-card flex items-center justify-center shadow-2xl shadow-primary/10 border border-primary/20 animate-bounce">
          <BharatmaanLogo size={80} />
        </div>
        <h1 className="text-4xl font-bold mt-10 tracking-tight text-foreground">Bharatmaan AI</h1>
        <div className="flex flex-col items-center gap-2 mt-3">
          <p className="text-primary font-bold tracking-[0.4em] uppercase text-sm">Your AI. Your India.</p>
          <div className="flex items-center gap-2 mt-8 text-[10px] text-muted-foreground animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Authenticating...
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar 
          activeSessionId={activeSessionId} 
          onSessionSelect={setActiveSessionId} 
        />
        <SidebarInset className="flex flex-col h-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center justify-center">
                <BharatmaanLogo size={32} />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-none">Bharatmaan AI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Secure Connection</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={clearChat} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-2">
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-secondary/30 flex items-center justify-center mb-8 border border-border/50 shadow-inner">
                    <BharatmaanLogo size={56} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Namaste! {user?.displayName || 'Friend'}.</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                    How can I assist you today on Krushna's private AI platform?
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-12 w-full max-w-sm">
                    {['India\'s space mission', 'Best street food', 'Learn Hindi', 'Tech in Bharat'].map(suggestion => (
                      <Button 
                        key={suggestion}
                        variant="outline" 
                        className="rounded-2xl h-auto py-3.5 text-xs bg-secondary/10 border-border/50 hover:bg-primary/10 hover:border-primary/30"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg as any} />
              ))}
              
              {isTyping && <TypingIndicator />}
            </div>
          </ScrollArea>

          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
