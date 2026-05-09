
"use client"

import React from 'react';
import { MessageSquare, Settings, Trash2, User, Plus, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser, useFirestore, useCollection, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BharatmaanLogo } from "@/components/brand/logo";
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AppSidebarProps {
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
}

export function AppSidebar({ activeSessionId, onSessionSelect }: AppSidebarProps) {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const sessionsQuery = user && db ? query(
    collection(db, 'users', user.uid, 'sessions'),
    orderBy('updatedAt', 'desc')
  ) : null;

  const { data: sessions = [] } = useCollection(sessionsQuery as any);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !db) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
    if (activeSessionId === id) onSessionSelect('');
  };

  const handleNewChat = async () => {
    if (!user || !db) return;
    const newSessionRef = doc(collection(db, 'users', user.uid, 'sessions'));
    const sessionId = newSessionRef.id;
    await setDoc(newSessionRef, {
      id: sessionId,
      title: 'New Conversation',
      updatedAt: Date.now()
    });
    onSessionSelect(sessionId);
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/auth');
    }
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mb-6 px-1">
          <BharatmaanLogo size={36} />
          <div>
            <h1 className="text-lg font-bold leading-none text-foreground tracking-tight">Bharatmaan AI</h1>
            <p className="text-[9px] text-primary font-bold tracking-[0.2em] uppercase mt-0.5">Your AI Friend</p>
          </div>
        </div>
        
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-11 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Recent Dialogues</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-xs text-muted-foreground font-medium">Ready for a new start?</p>
                </div>
              ) : (
                sessions.map((session: any) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton 
                      isActive={activeSessionId === session.id}
                      onClick={() => onSessionSelect(session.id)}
                      className="rounded-xl h-10 px-4 hover:bg-secondary/80 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="truncate font-medium">{session.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction 
                      onClick={(e) => handleDelete(e, session.id)}
                      className="hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 gap-2">
        <Separator className="bg-border/30 mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-xl px-4 hover:bg-secondary/80 font-medium">
              <User className="w-4 h-4 mr-2" />
              <span className="truncate">{user?.displayName || user?.email || 'User Profile'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-xl px-4 hover:bg-secondary/80 font-medium">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="rounded-xl px-4 text-destructive/80 hover:bg-destructive/10 hover:text-destructive font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="mt-4 p-4 rounded-2xl bg-secondary/20 border border-border/50 backdrop-blur-sm">
          <p className="text-[9px] text-muted-foreground mb-1.5 font-bold tracking-widest uppercase opacity-70">Architecture By</p>
          <p className="text-sm font-bold text-foreground tracking-tight italic">Krushna</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
