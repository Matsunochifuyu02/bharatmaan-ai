"use client"

import React from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/lib/chat-store";
import { format } from "date-fns";
import { User } from "lucide-react";
import { BharatmaanLogo } from "@/components/brand/logo";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.role === 'model';
  
  return (
    <div className={cn(
      "flex w-full mb-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[70%]",
        isAI ? "items-start" : "items-end"
      )}>
        <div className="flex items-center gap-2 mb-1.5 px-2">
          {isAI ? (
            <>
              <BharatmaanLogo size={24} />
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Bharatmaan AI</span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">User</span>
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-border">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </>
          )}
        </div>

        <div className={cn(
          "px-4 py-3 shadow-sm",
          isAI 
            ? "bg-card text-card-foreground rounded-2xl rounded-tl-none border border-border/50" 
            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-none shadow-primary/20"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <span className="text-[10px] text-muted-foreground mt-1 px-2 font-medium">
          {format(message.timestamp, 'h:mm a')}
          {message.persona && ` • ${message.persona.replace('_', ' ')}`}
        </span>
      </div>
    </div>
  );
}
