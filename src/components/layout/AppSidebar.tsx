"use client"

import React, { useEffect, useState } from 'react';
import { MessageSquare, Settings, Trash2, LogOut, Sparkles, User, HelpCircle } from "lucide-react";
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
import { ChatSession, getSessions, deleteSession, createSession, clearAllSessions } from "@/lib/chat-store";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
}

export function AppSidebar({ activeSessionId, onSessionSelect }: AppSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setSessions(getSessions());
    // Polling or listening for session changes could be added here
  }, [activeSessionId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(getSessions());
  };

  const handleNewChat = () => {
    const session = createSession();
    setSessions(getSessions());
    onSessionSelect(session.id);
  };

  const handleClear = () => {
    clearAllSessions();
    setSessions([]);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-foreground">Bharatmaan AI</h1>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Your AI Friend</p>
          </div>
        </div>
        
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-11 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">Recent History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton 
                      isActive={activeSessionId === session.id}
                      onClick={() => onSessionSelect(session.id)}
                      className="rounded-xl h-10 px-4 hover:bg-secondary/80 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="truncate">{session.title}</span>
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
            <SidebarMenuButton className="rounded-xl px-4 hover:bg-secondary/80">
              <User className="w-4 h-4 mr-2" />
              Profile
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-xl px-4 hover:bg-secondary/80">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleClear}
              className="rounded-xl px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Chats
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="mt-4 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">DEVELOPER CREDIT</p>
          <p className="text-xs font-bold text-foreground">Created by Krushna</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

import { Plus } from "lucide-react";