import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex w-full mt-4 space-x-3 max-w-4xl mx-auto justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700">
        <Bot className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl max-w-[85%] bg-zinc-800/80 border border-zinc-700/50 rounded-tl-sm flex items-center space-x-1.5 h-11">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
