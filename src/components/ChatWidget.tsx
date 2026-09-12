import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Settings, 
  Sparkles, 
  PhoneCall, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { ChatMessage, AppVariant, EscalationType } from '../types';
import { QUICK_SUGGESTED_QUESTIONS, DAZZLE_DENTAL_KNOWLEDGE } from '../data/prompts';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  onOpenLeadDrawer: () => void;
  onResetChat: () => void;
  variant: AppVariant;
  groqKeyActive: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  isLoading,
  onOpenSettings,
  onOpenLeadDrawer,
  onResetChat,
  variant,
  groqKeyActive,
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const title = variant === 'dazzle_dental' ? 'Aria · Dazzle Dental' : 'Consultant · JWS Interiors';
  const subtitle = variant === 'dazzle_dental' ? '24/7 International Patient Concierge' : 'Luxury $50k+ Scope Qualifier';

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          id="chat-floating-launcher"
          onClick={onToggle}
          aria-label="Open Aria Concierge Chat"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-gradient-to-br from-[#f3e2a9] via-[#c9a84c] to-[#a08233] text-[#0b0d10] p-4 rounded-full shadow-2xl shadow-[#c9a84c]/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-[#0b0d10]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b0d10] animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0b0d10]/80">Ask Concierge</span>
            <span className="text-sm font-bold leading-tight">Talk to Aria 24/7</span>
          </div>
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full border border-[#c9a84c]/50 animate-ping pointer-events-none opacity-40" />
        </button>
      )}

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div
          id="aria-chat-panel"
          className={`fixed z-50 flex flex-col bg-[#12151a] border border-[#242932] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl ${
            isExpandedFull
              ? 'inset-3 sm:inset-6 max-w-5xl mx-auto h-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[640px] max-h-[calc(100vh-32px)]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#161a20] border-b border-[#242932] px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c9a84c] to-[#f3e2a9] text-[#12151a] font-serif font-bold text-lg flex items-center justify-center shadow-md">
                  {variant === 'dazzle_dental' ? 'A' : 'J'}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#161a20]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#f3efe7]">{title}</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#c9a84c]/15 text-[#f3e2a9] border border-[#c9a84c]/30">
                    Live Demo
                  </span>
                </div>
                <p className="text-[11px] text-[#9aa0aa]">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-inspect-lead-crm"
                onClick={onOpenLeadDrawer}
                title="View Real-Time Extracted Lead Record"
                className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <UserCheck className="w-4 h-4 text-[#c9a84c]" />
                <span className="hidden sm:inline text-[11px] font-medium text-[#c9a84c]">Lead CRM</span>
              </button>

              <button
                id="btn-open-settings"
                onClick={onOpenSettings}
                title="Demo & Groq Inference Settings"
                className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                id="btn-reset-chat"
                onClick={onResetChat}
                title="Restart Conversation"
                className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpandedFull(!isExpandedFull)}
                title={isExpandedFull ? 'Shrink to default' : 'Expand panel'}
                className="hidden sm:block p-2 text-[#9aa0aa] hover:text-[#f3efe7] hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Toggle Expand"
              >
                {isExpandedFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                id="btn-close-chat"
                onClick={onToggle}
                className="p-2 text-[#9aa0aa] hover:text-[#f3efe7] hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model status bar */}
          <div className="bg-[#0e1115] px-4 py-1.5 border-b border-[#242932] flex items-center justify-between text-[11px] text-[#9aa0aa]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {groqKeyActive ? 'Groq Live Inference (openai/gpt-oss-120b)' : 'Local Guardrail Engine (Safe Demo Mode)'}
              </span>
            </div>
            <button 
              onClick={onOpenSettings} 
              className="text-[#c9a84c] hover:underline text-[10px]"
            >
              {groqKeyActive ? 'Key Active' : 'Enter Groq Key'}
            </button>
          </div>

          {/* Message History */}
          <div 
            id="chat-scroll-container"
            className="flex-1 overflow-y-auto p-4 space-y-4 text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] font-medium rounded-tr-sm shadow-md'
                      : 'bg-[#161a20] text-[#f3efe7] border border-[#242932] rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  
                  {/* Escalation Action Card */}
                  {msg.isEscalation && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3e2a9]">
                        {msg.escalationType === 'pain_emergency' ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Clinical Emergency Triage Handoff</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Direct Coordinator Handoff</span>
                          </>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <a
                          href={DAZZLE_DENTAL_KNOWLEDGE.whatsappContact}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>WhatsApp Direct</span>
                        </a>

                        <a
                          href={DAZZLE_DENTAL_KNOWLEDGE.calendlyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#242932] hover:bg-[#323946] text-[#f3efe7] rounded-lg text-xs font-semibold transition-colors border border-white/10"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#c9a84c]" />
                          <span>Free Video Consult</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-[#9aa0aa] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-[#9aa0aa] bg-[#161a20] border border-[#242932] px-3.5 py-2.5 rounded-2xl rounded-tl-sm w-fit text-xs">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" />
                </span>
                <span className="text-[11px] text-[#f3efe7]/80">Aria is checking clinic protocols…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-[#12151a] border-t border-[#242932]/70 overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 bg-[#161a20] hover:bg-[#242932] text-[#f3efe7]/90 hover:text-[#f3e2a9] border border-[#242932] rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#161a20] border-t border-[#242932]">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                id="aria-chat-input"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aria about treatment, price bands, or travel logistics…"
                className="flex-1 bg-[#12151a] text-[#f3efe7] placeholder-[#9aa0aa]/70 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#242932] focus:outline-none focus:border-[#c9a84c] transition-colors resize-none max-h-24"
              />
              <button
                type="submit"
                id="aria-chat-send-btn"
                disabled={!inputText.trim() || isLoading}
                aria-label="Send Message"
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-[#9aa0aa] text-center mt-2 leading-tight">
              Aria provides informative price bands and travel logistics. Clinical quotes & assessments are verified by Dazzle Dental's clinical team.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
