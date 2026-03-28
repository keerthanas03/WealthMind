import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface AdvisorProps {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  sendMessage: (v: string) => void;
  loading: boolean;
}

const SUGGESTIONS = [
  'How should I diversify my portfolio?',
  'Best SIP strategy for 10 years?',
  'How to save tax on investments?',
  'What is a good emergency fund size?',
];

export const Advisor: React.FC<AdvisorProps> = ({ messages, input, setInput, sendMessage, loading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-200">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">AI Financial Advisor</h2>
          <p className="text-xs text-slate-400 font-medium">Powered by WealthMind AI Intelligence</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto mb-5 space-y-4 pr-1">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                <MessageSquare size={36} className="text-violet-400" />
              </div>
              <p className="text-lg font-black text-slate-700 mb-1">How can I help you today?</p>
              <p className="text-xs text-slate-400 font-medium">Ask me anything about personal finance, investments, or budgeting.</p>
            </div>
            {/* Suggestion chips */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="p-3.5 text-left rounded-2xl bg-white/60 border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-[11px] font-bold text-slate-600 hover:text-violet-700 group"
                >
                  <span className="group-hover:text-violet-500 transition-colors">→</span> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-5 rounded-2xl max-w-[82%] ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-xl shadow-rose-200/50'
                : 'bg-white/60 border border-slate-200/80 shadow-sm backdrop-blur-sm'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">WealthMind AI</span>
                </div>
              )}
              <p className="font-semibold text-[13px] leading-relaxed">{msg.text}</p>
              {msg.why && (
                <div className="mt-4 pt-3 border-t border-slate-200/30">
                  <p className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">Reasoning</p>
                  <p className={`text-[11px] font-medium leading-relaxed ${msg.role === 'user' ? 'text-white/80' : 'text-slate-500'}`}>{msg.why}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="p-5 rounded-2xl bg-white/60 border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 p-4 rounded-2xl bg-white/60 border border-slate-200/80 shadow-lg backdrop-blur-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          className="flex-1 bg-transparent text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Ask about taxes, SIPs, investments, or budgeting..."
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-lg hover:shadow-rose-300/50 transition-all active:scale-95 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
