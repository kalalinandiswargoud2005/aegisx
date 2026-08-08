import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'error';
  content: string;
  isStreaming: boolean;
}

export interface ConversationContext {
  currentPage: string;
  userRole: string;
  deviceStatus?: any;
  currentThreats?: any[];
  analyticsSummary?: any;
}

export function useAIChat(context: ConversationContext) {
  const { subscribe, publish, isConnected } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe(`ai-response/${sessionIdRef.current}`, (response) => {
        handleIncomingResponse(response);
      });
      return () => unsubscribe();
    }
  }, [isConnected, subscribe]);

  const handleIncomingResponse = useCallback((response: any) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      
      // If error or we are starting a new response block
      if (response.role === 'error') {
        setIsTyping(false);
        return [...prevMessages, {
          id: Date.now().toString(),
          role: 'error',
          content: response.content,
          isStreaming: false
        }];
      }

      if (lastMessage && lastMessage.role === 'model' && lastMessage.isStreaming) {
        // Append to existing streaming message
        const updatedContent = lastMessage.content + (response.content || '');
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: updatedContent,
          isStreaming: !response.isFinished
        };
        
        if (response.isFinished) {
          setIsTyping(false);
        }
        return updatedMessages;
      } else {
        // Start a new streaming message
        if (response.isFinished && !response.content) {
            setIsTyping(false);
            return prevMessages; // Just a finished signal with no content
        }
        return [...prevMessages, {
          id: Date.now().toString(),
          role: 'model',
          content: response.content || '',
          isStreaming: !response.isFinished
        }];
      }
    });
  }, []);

  const sendMessage = useCallback((prompt: string) => {
    if (!prompt.trim() || !isConnected) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      isStreaming: false
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Send to backend
    if (isConnected) {
      publish('ai/chat', {
        prompt,
        sessionId: sessionIdRef.current,
        context
      });
    }
  }, [isConnected, publish, context]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
    isTyping,
    clearHistory
  };
}
