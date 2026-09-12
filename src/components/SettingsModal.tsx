import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, AlertCircle, Sparkles, Check } from 'lucide-react';
import { GroqSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GroqSettings;
  onSave: (newSettings: GroqSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [workerUrl, setWorkerUrl] = useState(settings.workerUrl);
  const [useFallbackEngine, setUseFallbackEngine] = useState(settings.useFallbackEngine);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiKey: apiKey.trim(),
      model,
      workerUrl: workerUrl.trim(),
      isDemoMode: true,
      useFallbackEngine
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="groq-settings-modal"
        className="w-full max-w-lg bg-[#12151a] border border-[#242932] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 bg-[#161a20] border-b border-[#242932] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f3efe7]">Inference & Demo Settings</h3>
              <p className="text-xs text-[#9aa0aa]">TRD §3 & §6 Groq LPU Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9aa0aa] hover:text-[#f3efe7] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="p-3.5 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl text-xs text-[#f3e2a9] flex gap-2.5 items-start">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#c9a84c] mt-0.5" />
            <div className="leading-relaxed">
              <strong>In-Memory Demo Mode:</strong> Any temporary Groq API key entered here is held strictly in browser RAM for this active session. It is never persisted to localStorage, cookies, or public repositories.
            </div>
          </div>

          {/* Groq API Key input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0aa] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#c9a84c]" />
              Groq API Key (Live Sales-Pitch Mode)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-[#161a20] border border-[#242932] rounded-xl px-4 py-2.5 text-sm text-[#f3efe7] placeholder-[#9aa0aa]/50 focus:outline-none focus:border-[#c9a84c]"
            />
            <p className="text-[11px] text-[#9aa0aa]">
              Leave blank to use the built-in Dazzle Dental Guardrail engine (zero key needed for immediate testing).
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0aa]">
              Groq LLM Model (TRD §3)
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#161a20] border border-[#242932] rounded-xl px-4 py-2.5 text-sm text-[#f3efe7] focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Primary Production — Best Reasoning)</option>
              <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Cost-Optimized / Speed Fallback)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Legacy)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (MoE Tier)</option>
            </select>
          </div>

          {/* Cloudflare Worker URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0aa]">
              Production Cloudflare Worker Endpoint (Optional)
            </label>
            <input
              type="text"
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              placeholder="https://dazzle-dental-proxy.workers.dev/chat"
              className="w-full bg-[#161a20] border border-[#242932] rounded-xl px-4 py-2.5 text-sm text-[#f3efe7] placeholder-[#9aa0aa]/50 focus:outline-none focus:border-[#c9a84c]"
            />
            <p className="text-[11px] text-[#9aa0aa]">
              Configures the server-side proxy route for production deployment where the key is stored in Cloudflare secrets.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#9aa0aa] hover:text-[#f3efe7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
