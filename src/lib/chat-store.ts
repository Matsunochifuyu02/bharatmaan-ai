"use client"

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  persona?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

const STORAGE_KEY = 'bharatmaan_ai_chats';

export const getSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSessions = (sessions: ChatSession[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const createSession = (initialMessage?: string): ChatSession => {
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title: initialMessage ? (initialMessage.slice(0, 30) + '...') : 'New Conversation',
    messages: [],
    updatedAt: Date.now(),
  };
  const sessions = getSessions();
  saveSessions([newSession, ...sessions]);
  return newSession;
};

export const deleteSession = (sessionId: string) => {
  const sessions = getSessions();
  saveSessions(sessions.filter(s => s.id !== sessionId));
};

export const clearAllSessions = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};