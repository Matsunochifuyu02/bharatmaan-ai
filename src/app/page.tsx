"use client"

import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Message, ChatSession, getSessions, saveSessions, createSession } from "@/lib/chat-store";
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

export default function BharatmaanChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSplash, setIsSplash] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const PRIVATE_SERVER_URL = 'https://ef84d6f6-5ad3-47ea-8889-16507c6e1c80-00-2ulk7xi0bas6p.pike.replit.dev/chat';

  useEffect(() => {
    // 1. Wake up the private server immediately on app load
    fetch(PRIVATE_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Server Wakeup Call", task: "ping" }),
    }).catch(() => {
      // Ignore errors for the initial wake-up call
    });

    // 2. Splash screen timer
    const timer = setTimeout(() => setIsSplash(false), 2500);

    // 3. Initialize chat sessions
    const initialSessions = getSessions();
    setSessions(initialSessions);
    if (initialSessions.length > 0) {
      setActiveSessionId(initialSessions[0].id);
    } else {
      const newSession = createSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
    
    return () => clearTimeout(timer);
  }, []);

  const currentSession = sessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId || !currentSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, messages: updatedMessages, updatedAt: Date.now() } : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    setIsTyping(true);

    try {
      const personaData = await adaptPersona({
        userMessage: content,
        chatHistory: currentSession.messages.slice(-5).map(m => m.content)
      });

      const aiReply = await getAiContextualReply({
        message: content,
        history: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiReply.reply,
        timestamp: Date.now(),
        persona: personaData.detectedPersona
      };

      const finalMessages = [...updatedMessages, aiMsg];
      const finalSessions = sessions.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: finalMessages, 
              updatedAt: Date.now(),
              title: s.messages.length === 0 ? (content.slice(0, 30) + '...') : s.title
            } 
          : s
      );
      
      setSessions(finalSessions);
      saveSessions(finalSessions);
    } catch (error) {
      console.error(error);
      toast({
        title: "Communication Error",
        description: "Bharatmaan AI is having trouble connecting to your private server. Please check the Repl status.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (!activeSessionId) return;
    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    toast({
      description: "Chat history cleared for this session.",
    });
  };

  if (isSplash) {
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
            Syncing Private AI Server...
          </div>
        </div>
        <div className="absolute bottom-12 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
          Innovated by Krushna
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
                <h2 className="text-sm font-bold leading-none">{currentSession?.title || 'Bharatmaan AI'}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Server Ready</span>
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
              {currentSession?.messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-secondary/30 flex items-center justify-center mb-8 border border-border/50 shadow-inner">
                    <BharatmaanLogo size={56} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Namaste! Bharatmaan here.</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                    I am your AI companion, built on your private server and created by Krushna. How can I help you today?
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-12 w-full max-w-sm">
                    {['Latest India Tech News', 'Emotional Support', 'Traditional Recipes', 'Help me Study'].map(suggestion => (
                      <Button 
                        key={suggestion}
                        variant="outline" 
                        className="rounded-2xl h-auto py-3.5 text-xs bg-secondary/10 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {currentSession?.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
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
