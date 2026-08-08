import React from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChatMessage } from '../useAIChat';
import { MarkdownRenderer } from './MarkdownRenderer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isModel = message.role === 'model';
  const isError = message.role === 'error';

  return (
    <div
      className={cn(
        "flex w-full mt-4 space-x-3 max-w-4xl mx-auto",
        isModel || isError ? "justify-start" : "justify-end"
      )}
    >
      {(isModel || isError) && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700">
          {isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Bot className="w-5 h-5 text-emerald-400" />
          )}
        </div>
      )}

      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[85%]",
          isError
            ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
            : isModel
            ? "bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 rounded-tl-sm"
            : "bg-emerald-600/90 text-white rounded-tr-sm"
        )}
      >
        {isModel ? (
          <>
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
            )}
          </>
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm md:text-base">
            {message.content}
          </div>
        )}
      </div>

      {!isModel && !isError && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600 border border-emerald-500">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
