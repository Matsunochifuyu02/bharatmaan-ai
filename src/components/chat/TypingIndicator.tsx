"use client"

import React from 'react';
import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-6 transition-all duration-300 animate-in fade-in">
      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[70%]">
        <div className="flex items-center gap-2 mb-1.5 px-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Bharatmaan AI</span>
        </div>
        
        <div className="bg-card text-card-foreground rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-border/50">
          <div className="flex items-center gap-2">
            <div className="typing-dots flex space-x-1">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-xs text-muted-foreground italic">Bharatmaan AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
}