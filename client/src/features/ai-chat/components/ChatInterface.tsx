'use client';

import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export const ChatInterface = () => {
  const { messages, sendMessage, isLoading, messagesEndRef } = useChat();
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[85vh] md:h-[600px] w-full max-w-xl mx-auto border border-slate-700 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="">
            <Image
              src="/icon.png"
              alt="Hedera x Chainlink Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg md:text-xl">Demo app</h3>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative bg-slate-950">
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
          <img 
            src="/logo.png" 
            alt="Background Logo" 
            className="w-2/3 max-w-md object-contain grayscale"
          />
        </div>

        {/* Scrollable Content */}
        <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === 'user' ? 'bg-purple-600 shadow-purple-900/20' : 'bg-blue-600 shadow-blue-900/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 md:w-6 md:h-6" /> : <Bot className="w-4 h-4 md:w-6 md:h-6" />}
              </div>
              <div className={`max-w-[85%] md:max-w-[80%] p-4 md:p-6 rounded-2xl md:rounded-3xl text-base md:text-lg leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-purple-600/10 text-purple-100 border border-purple-500/20 rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 md:gap-6">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
                <Bot className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <div className="bg-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl rounded-tl-none flex gap-2 items-center border border-slate-700">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2 md:gap-4 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about Hedera transactions..."
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12 md:h-14 text-base md:text-lg px-4 md:px-6 rounded-lg md:rounded-xl"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 h-12 w-12 md:h-14 md:w-14 rounded-lg md:rounded-xl shrink-0 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
        <div className="text-center mt-3">
            <p className="text-xs text-slate-500">
                Powered by hedera-xchainlink-plugin
            </p>
        </div>
      </div>
    </div>
  );
};
