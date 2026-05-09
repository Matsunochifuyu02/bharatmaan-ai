"use client"

import React from 'react';
import { BharatmaanLogo } from "@/components/brand/logo";

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[70%]">
        <div className="flex items-center gap-2 mb-1.5 px-2">
          <BharatmaanLogo size={24} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Bharatmaan AI</span>
        </div>
        
        <div className="bg-card text-card-foreground rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3">
            <div className="typing-dots flex space-x-1.5">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-xs text-muted-foreground font-bold tracking-tight animate-text-pulse">
              Bharatmaan AI is typing...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
