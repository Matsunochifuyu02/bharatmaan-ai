"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-secondary/50 p-2 rounded-2xl border border-border/50 focus-within:border-primary/50 transition-all shadow-lg backdrop-blur-md">
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary">
          <Plus className="w-5 h-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Bharatmaan..."
          className="min-h-[44px] max-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-3 resize-none text-sm placeholder:text-muted-foreground"
          disabled={disabled}
        />

        <div className="flex gap-1">
          {!message && (
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary">
              <Mic className="w-5 h-5" />
            </Button>
          )}
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={cn(
              "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
              message.trim() ? "bg-primary text-primary-foreground scale-100" : "bg-muted text-muted-foreground scale-90"
            )}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
        Bharatmaan AI can make mistakes. Check important info.
      </p>
    </div>
  );
}

import { cn } from "@/lib/utils";