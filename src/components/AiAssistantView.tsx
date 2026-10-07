import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CornerDownLeft,
  RefreshCw,
  Users,
} from 'lucide-react';
import { api } from '../api';
import { FamilyMember } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantViewProps {
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  familyMembers,
  activeMember,
  onSelectMember,
}) => {
  const currentMember = activeMember || familyMembers[0];

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!currentMember) return;
    setMessages([{
      id: `init-${currentMember.id}`,
      sender: 'assistant',
      text: `Hello! I'm Healthyfy AI, your personal and family wellness assistant powered by Google Gemini.\n\nCurrently viewing health context for: **${currentMember.name}** (${currentMember.relationship}, ${currentMember.age} yrs, ${currentMember.existingConditions.join(', ') || 'No chronic conditions'}).\n\nHow can I help you today?`,
      timestamp: 'Just now',
    }]);
  }, [currentMember?.id]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Explain my recent lipid report',
    'What foods help lower triglycerides?',
    'How can I improve deep sleep?',
    'What questions should I ask my cardiologist?',
    'Explain HbA1c in simple terms',
  ];

  const handleSend = async (messageText?: string) => {
    if (!currentMember) return;
    const textToSend = (messageText || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.chatWithAi(textToSend, currentMember.id);
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'I apologize, I am temporarily having trouble reaching the Gemini service. Please verify your connection or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!currentMember) return <div className="p-8 text-center text-sm text-slate-500">Add a family member to use the AI assistant.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Healthyfy AI Assistant</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Context: <strong className="text-slate-700">{currentMember.name}</strong> ({currentMember.relationship})
            </p>
          </div>
        </div>

        {/* Member Switcher */}
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={currentMember.id}
            onChange={(e) => {
              const m = familyMembers.find((item) => item.id === e.target.value);
              if (m) onSelectMember(m);
            }}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-hidden cursor-pointer"
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                Context: {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1.5 ${
                    isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Healthyfy AI is thinking with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Suggested:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${currentMember.name}'s reports, nutrition, medication timing, or wellness...`}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Informational wellness guidance. Not a substitute for a licensed physician.</span>
          </div>
          <span className="hidden sm:inline">Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
