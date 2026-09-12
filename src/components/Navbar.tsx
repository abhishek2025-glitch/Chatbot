import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Settings, 
  Code2, 
  Database, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { AppVariant } from '../types';

interface NavbarProps {
  variant: AppVariant;
  onVariantChange: (v: AppVariant) => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onOpenLeadDrawer: () => void;
  onOpenExportModal: () => void;
  isChatOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  variant,
  onVariantChange,
  onOpenChat,
  onOpenSettings,
  onOpenLeadDrawer,
  onOpenExportModal,
  isChatOpen,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0b0d10]/90 backdrop-blur-md border-b border-[#242932]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#c9a84c] to-[#f3e2a9] flex items-center justify-center text-[#12151a] font-serif font-extrabold text-lg shadow-md shadow-[#c9a84c]/20">
            {variant === 'dazzle_dental' ? 'D' : 'J'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-[#f3efe7] tracking-tight">
                {variant === 'dazzle_dental' ? 'Dazzle Dental' : 'JWS Interiors'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#c9a84c]/15 text-[#f3e2a9] border border-[#c9a84c]/30 rounded">
                Live Sales Demo
              </span>
            </div>
            <p className="text-[11px] text-[#9aa0aa] hidden sm:block">
              {variant === 'dazzle_dental' ? 'Aria 24/7 International Concierge' : '$50k+ Scope Qualifier'}
            </p>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#9aa0aa]">
          <a href="#problem" className="hover:text-[#f3efe7] transition-colors">The 3AM Problem</a>
          <a href="#what-aria-does" className="hover:text-[#f3efe7] transition-colors">Concierge Scope</a>
          <a href="#roi-engine" className="hover:text-[#f3efe7] transition-colors">ROI Calculator</a>
          <a href="#guardrails" className="hover:text-[#f3efe7] transition-colors">Guardrail Tests</a>
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Variant Selector */}
          <div className="relative group">
            <button
              id="variant-switch-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161a20] border border-[#242932] text-xs font-medium text-[#f3efe7] hover:border-[#c9a84c]/50 transition-colors"
              title="Switch demo client variant (Dental vs Luxury Interior Studio)"
            >
              <Layers className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span className="hidden sm:inline">
                {variant === 'dazzle_dental' ? 'Dazzle Dental' : 'JWS Interiors'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#9aa0aa]" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#161a20] border border-[#242932] rounded-xl shadow-xl py-1.5 hidden group-hover:block transition-all">
              <button
                onClick={() => onVariantChange('dazzle_dental')}
                className={`w-full text-left px-3.5 py-2 text-xs flex flex-col transition-colors ${
                  variant === 'dazzle_dental' ? 'bg-[#c9a84c]/15 text-[#f3e2a9]' : 'text-[#9aa0aa] hover:text-[#f3efe7] hover:bg-white/5'
                }`}
              >
                <span className="font-bold">Dazzle Dental (Flagship)</span>
                <span className="text-[10px] text-[#9aa0aa]">International Patient Concierge</span>
              </button>
              <button
                onClick={() => onVariantChange('jws_interiors')}
                className={`w-full text-left px-3.5 py-2 text-xs flex flex-col transition-colors ${
                  variant === 'jws_interiors' ? 'bg-[#c9a84c]/15 text-[#f3e2a9]' : 'text-[#9aa0aa] hover:text-[#f3efe7] hover:bg-white/5'
                }`}
              >
                <span className="font-bold">JWS Interiors (PRD §9 Variant)</span>
                <span className="text-[10px] text-[#9aa0aa]">$50k+ Scope Qualifier</span>
              </button>
            </div>
          </div>

          {/* Lead CRM Button */}
          <button
            onClick={onOpenLeadDrawer}
            title="Inspect Live Lead Record"
            className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Database className="w-4 h-4 text-[#c9a84c]" />
            <span className="hidden lg:inline text-xs font-semibold text-[#f3efe7]">Lead CRM</span>
          </button>

          {/* Export Code Modal */}
          <button
            onClick={onOpenExportModal}
            title="Get Standalone index.html & Cloudflare Worker"
            className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Groq Settings */}
          <button
            onClick={onOpenSettings}
            title="Inference & Groq Settings"
            className="p-2 text-[#9aa0aa] hover:text-[#f3e2a9] hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary CTA */}
          <button
            id="nav-talk-aria-btn"
            onClick={onOpenChat}
            className="ml-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#c9a84c]/20"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#12151a]" />
            <span>{isChatOpen ? 'Chat Active' : 'Talk to Aria'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
