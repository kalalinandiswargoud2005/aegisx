import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../useAIChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedPrompts } from './SuggestedPrompts';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function ChatWindow({ messages, isTyping, onSelectPrompt }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-widest text-glow">How can I help you today?</h2>
            <p className="text-white/60 font-mono">
              I am your ASTRA AI Assistant. I can explain threats, summarize system health, or help you navigate the platform.
            </p>
          </div>
          <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
        </div>
      ) : (
        <div className="flex flex-col space-y-4 max-w-4xl mx-auto w-full pb-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
