import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Globe2, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PhoneCall, 
  Calendar, 
  ArrowRight, 
  Plane, 
  Hotel, 
  FileCheck2, 
  UserCheck, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Code2
} from 'lucide-react';
import { ThreeHeroCanvas } from './components/ThreeHeroCanvas';
import { Navbar } from './components/Navbar';
import { ChatWidget } from './components/ChatWidget';
import { LeadExtractorDrawer } from './components/LeadExtractorDrawer';
import { ClinicRoiCalculator } from './components/ClinicRoiCalculator';
import { GuardrailTester } from './components/GuardrailTester';
import { SettingsModal } from './components/SettingsModal';
import { DeployExportModal } from './components/DeployExportModal';
import { ChatMessage, LeadRecord, AppVariant, GroqSettings } from './types';
import { 
  DAZZLE_DENTAL_KNOWLEDGE, 
  DAZZLE_DENTAL_SYSTEM_PROMPT, 
  JWS_INTERIORS_SYSTEM_PROMPT 
} from './data/prompts';
import { generateChatReply } from './services/aiService';

export default function App() {
  const [variant, setVariant] = useState<AppVariant>('dazzle_dental');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In-memory Groq settings (per TRD §6: kept in memory, never persisted or committed)
  const [groqSettings, setGroqSettings] = useState<GroqSettings>({
    apiKey: '',
    model: 'openai/gpt-oss-120b',
    workerUrl: '',
    isDemoMode: true,
    useFallbackEngine: true
  });

  // Initial welcome message from Aria (with mandatory AI disclosure per PRD §6)
  const getInitialMessage = (v: AppVariant): ChatMessage => {
    if (v === 'jws_interiors') {
      return {
        id: 'init-jws',
        role: 'assistant',
        content: "Hello and welcome to JWS Interiors. I'm the studio's AI design consultant (an automated assistant, not a designer). We specialize in luxury residential and commercial transformations starting from $50,000+ in scope.\n\nWhat kind of space or project are you envisioning?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return {
      id: 'init-aria',
      role: 'assistant',
      content: "Hello, I'm Aria — Dazzle Dental's AI concierge. I am an AI assistant available 24/7 to guide you through procedure timelines, typical price bands, and international travel arrangements.\n\nWhat treatment are you exploring today, and which country would you be traveling from?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage('dazzle_dental')]);

  // Lead capture data model (PRD §8)
  const [leadRecord, setLeadRecord] = useState<LeadRecord>({
    name: '',
    homeCountry: '',
    procedureInterest: '',
    budgetBand: '',
    travelTimeframe: '',
    preferredContact: '',
    conversationSummary: 'Initial greeting initiated.',
    escalationFlag: false,
    qualificationStatus: 'In Discussion',
    lastUpdated: new Date().toLocaleTimeString()
  });

  // Switch variants cleanly
  const handleVariantChange = (newVariant: AppVariant) => {
    setVariant(newVariant);
    setMessages([getInitialMessage(newVariant)]);
    setLeadRecord({
      name: '',
      homeCountry: '',
      procedureInterest: newVariant === 'jws_interiors' ? 'Luxury Residence Renovation' : '',
      budgetBand: '',
      travelTimeframe: '',
      preferredContact: '',
      conversationSummary: 'Conversation switched to ' + (newVariant === 'dazzle_dental' ? 'Dazzle Dental' : 'JWS Interiors'),
      escalationFlag: false,
      qualificationStatus: 'In Discussion',
      lastUpdated: new Date().toLocaleTimeString()
    });
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage(variant)]);
    setLeadRecord({
      name: '',
      homeCountry: '',
      procedureInterest: '',
      budgetBand: '',
      travelTimeframe: '',
      preferredContact: '',
      conversationSummary: 'Conversation restarted.',
      escalationFlag: false,
      qualificationStatus: 'In Discussion',
      lastUpdated: new Date().toLocaleTimeString()
    });
  };

  // Send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const result = await generateChatReply(
        newHistory,
        variant,
        groqSettings.apiKey,
        groqSettings.model
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEscalation: result.isEscalation,
        escalationType: result.escalationType,
        escalationAction: result.isEscalation ? {
          label: 'Speak with Patient Coordinator',
          whatsappUrl: DAZZLE_DENTAL_KNOWLEDGE.whatsappContact,
          calendlyUrl: DAZZLE_DENTAL_KNOWLEDGE.calendlyUrl
        } : undefined
      };

      setMessages([...newHistory, botMsg]);

      // Merge extracted lead fields
      if (result.extractedLeadUpdates) {
        setLeadRecord(prev => ({
          ...prev,
          ...result.extractedLeadUpdates,
          escalationFlag: result.isEscalation ? true : prev.escalationFlag,
          lastUpdated: new Date().toLocaleTimeString()
        }));
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggering test from Guardrail Tester
  const handleRunGuardrailTest = (prompt: string) => {
    setIsChatOpen(true);
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#f3efe7] relative selection:bg-[#c9a84c]/30 selection:text-[#f3e2a9]">
      {/* Top Navbar */}
      <Navbar
        variant={variant}
        onVariantChange={handleVariantChange}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeadDrawer={() => setIsLeadDrawerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isChatOpen={isChatOpen}
      />

      {/* Hero Section with 3D Canvas */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ThreeHeroCanvas />

        {/* Ambient radial glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#c9a84c]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#f3e2a9] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
              <span>Proof of Work Sales Demo · Built for Dazzle Dental</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#f3efe7] tracking-tight leading-[1.08]">
              Your international patients ask questions at <em className="italic text-[#f3e2a9] font-serif">3:00 AM.</em> Now someone answers.
            </h1>

            <p className="text-base sm:text-lg text-[#9aa0aa] max-w-2xl leading-relaxed">
              This is <strong className="text-[#f3efe7]">Aria</strong> — an embeddable AI concierge operating on Groq inference, trained specifically on Dazzle Dental’s procedures, price ranges, and VIP travel logistics. Not a canned chatbot. A finished, working asset ready to capture high-ticket cases while your team sleeps.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-talk-aria-btn"
                onClick={() => setIsChatOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e3cd8d] via-[#c9a84c] to-[#b39137] text-[#12151a] font-bold text-sm sm:text-base flex items-center gap-2 hover:shadow-xl hover:shadow-[#c9a84c]/20 hover:scale-[1.02] active:scale-98 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Aria Concierge</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#guardrails"
                className="px-5 py-3.5 rounded-xl bg-[#161a20] border border-[#242932] hover:border-[#c9a84c]/50 text-[#f3efe7] font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#c9a84c]" />
                <span>Test 5 Safety Guardrails</span>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 border-t border-[#242932]/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-xs text-[#9aa0aa]">Target Case Ticket</p>
                <p className="text-lg sm:text-xl font-bold font-serif text-[#f3e2a9]">$3k – $25k+</p>
              </div>
              <div>
                <p className="text-xs text-[#9aa0aa]">Inference Speed</p>
                <p className="text-lg sm:text-xl font-bold font-serif text-[#f3e2a9]">&lt;450ms (Groq)</p>
              </div>
              <div>
                <p className="text-xs text-[#9aa0aa]">Languages</p>
                <p className="text-lg sm:text-xl font-bold font-serif text-[#f3e2a9]">Arabic, RU, ES +</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Proof Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#12151a]/85 backdrop-blur-xl border border-[#242932] rounded-2xl p-6 shadow-2xl space-y-5 relative">
              <div className="flex items-center justify-between border-b border-[#242932] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#c9a84c] to-[#f3e2a9] text-[#12151a] font-serif font-bold text-sm flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f3efe7]">What Aria Does in Real Time</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Concierge Ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLeadDrawerOpen(true)}
                  className="text-xs text-[#c9a84c] hover:underline flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Inspect CRM</span>
                </button>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-[#9aa0aa]">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</span>
                  <span><strong className="text-[#f3efe7]">Answers in patient's native tongue:</strong> Fluently replies in Arabic, Russian, German, or Spanish.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</span>
                  <span><strong className="text-[#f3efe7]">Quotes honest price bands:</strong> Explains ranges ($4.5k–$9k for veneers) while strictly refusing diagnostic quotes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</span>
                  <span><strong className="text-[#f3efe7]">Natural lead qualification:</strong> Seamlessly captures home country, budget, procedure, and timeframe into structured fields.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">4</span>
                  <span><strong className="text-[#f3efe7]">Zero clinical liability:</strong> Never diagnoses symptoms or recommends drugs — pain escalates immediately to WhatsApp.</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-2.5 px-4 bg-[#161a20] hover:bg-[#242932] border border-[#c9a84c]/30 text-[#f3e2a9] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Interactive Chat Panel (Bottom Right)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRD §2: The Lead & The Problem Section */}
      <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#242932]/70 bg-[#0e1115]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 text-[#f3e2a9] text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              The Funnel Leak
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f3efe7] mb-4">
              Why High-Ticket Dental Clinics Lose $5k–$25k International Cases
            </h2>
            <p className="text-sm sm:text-base text-[#9aa0aa] leading-relaxed">
              International patients research treatment abroad late at night in their own timezones. While the clinic’s physical front desk is closed, warm leads go cold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base">
                11PM
              </div>
              <h3 className="text-base font-bold text-[#f3efe7]">The Timezone Mismatch</h3>
              <p className="text-xs text-[#9aa0aa] leading-relaxed">
                Prospects in London, New York, or Sydney search for smile makeovers during their evening relaxation hours — when your reception team is offline for the next 8–12 hours.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-base">
                10x
              </div>
              <h3 className="text-base font-bold text-[#f3efe7]">Repetitive FAQ Backlog</h3>
              <p className="text-xs text-[#9aa0aa] leading-relaxed">
                WhatsApp and Instagram DMs pile up with the same 10 inquiries: procedure cost, trip duration, airport pickup, and hotel partnerships.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 text-[#f3e2a9] flex items-center justify-center font-bold text-base">
                -60%
              </div>
              <h3 className="text-base font-bold text-[#f3efe7]">The Cost of Delay</h3>
              <p className="text-xs text-[#9aa0aa] leading-relaxed">
                Every hour of delay on a $5k–$25k dental decision measurably drops conversion. When you finally reply 14 hours later, the patient has already spoken to a competing clinic.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-base">
                $$$
              </div>
              <h3 className="text-base font-bold text-[#f3efe7]">Wasted Clinical Payroll</h3>
              <p className="text-xs text-[#9aa0aa] leading-relaxed">
                Staff time is too expensive to spend re-typing basic accommodation details instead of conducting high-value case consults and closing ready patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRD §3 & §6: What Aria Does Section */}
      <section id="what-aria-does" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 text-[#f3e2a9] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              PRD §3 Core Functional Scope
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f3efe7] mb-4">
              What Aria Delivers 24 Hours a Day
            </h2>
            <p className="text-sm sm:text-base text-[#9aa0aa] leading-relaxed">
              Designed specifically for cosmetic clinics treating medical tourists. It informs, qualifies, safeguards against liability, and hands off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#c9a84c]/10 text-[#c9a84c]">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#f3efe7]">1. Multilingual 24/7 Patient Guidance</h3>
              </div>
              <p className="text-sm text-[#9aa0aa] leading-relaxed">
                Detects and fluently answers in the patient's language for primary medical tourism origin markets: Arabic, Russian, German, Spanish, and English. Answers questions about travel timelines, flight logistics, and airport pickup effortlessly.
              </p>
              <div className="p-3 bg-[#161a20] rounded-xl border border-[#242932] text-xs text-[#f3e2a9]">
                💡 Try typing: <code className="text-[#f3efe7] font-mono">"مرحباً، كم تكلفة الفينير وكم يوماً أحتاج للبقاء؟"</code> in the chat widget!
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#c9a84c]/10 text-[#c9a84c]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#f3efe7]">2. Conversational Lead Qualification</h3>
              </div>
              <p className="text-sm text-[#9aa0aa] leading-relaxed">
                Never interrogates visitors with an aggressive 8-field form. Aria naturally weaves questions into dialogue, identifying patient name, procedure of interest, budget band, travel window, and contact info so mornings begin with qualified case files.
              </p>
              <div className="p-3 bg-[#161a20] rounded-xl border border-[#242932] text-xs text-[#f3e2a9] flex justify-between items-center">
                <span>View real-time extracted data model:</span>
                <button
                  onClick={() => setIsLeadDrawerOpen(true)}
                  className="px-2.5 py-1 bg-[#c9a84c] text-[#12151a] rounded font-bold hover:brightness-110"
                >
                  Open Lead CRM
                </button>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#f3efe7]">3. Zero Diagnostic Clinical Shield</h3>
              </div>
              <p className="text-sm text-[#9aa0aa] leading-relaxed">
                Hard-coded system guardrails strictly prohibit clinical advice or binding single-case pricing. Symptoms of pain or emergencies immediately disclaim diagnosis and route directly to urgent clinical contact.
              </p>
              <div className="p-3 bg-[#161a20] rounded-xl border border-[#242932] text-xs text-emerald-400">
                🛡️ Enforces range quoting: "typically $4.5k–$9k for 8–10 veneers, confirmed after clinical scan."
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#f3efe7]">4. Intent-Triggered Escalation</h3>
              </div>
              <p className="text-sm text-[#9aa0aa] leading-relaxed">
                The moment a visitor expresses readiness ("I want to book," "can I talk to someone," "my travel is in November"), Aria stops questioning and presents direct action cards for WhatsApp and Calendly video consultations.
              </p>
              <div className="p-3 bg-[#161a20] rounded-xl border border-[#242932] text-xs text-blue-300">
                ⚡ Hands off warm, qualified buyers cleanly without forcing them to repeat themselves.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedure & Knowledge Base Explorer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0e1115] border-t border-[#242932]/70">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 text-[#f3e2a9] text-xs font-semibold uppercase tracking-wider mb-3">
              <Plane className="w-3.5 h-3.5" />
              Verified Knowledge Base
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f3efe7] mb-4">
              Dazzle Dental Clinic Procedures & Price Bands
            </h2>
            <p className="text-sm sm:text-base text-[#9aa0aa] leading-relaxed">
              These are the actual verified procedure bands and travel logistics Aria uses to answer international inquiries accurately without making binding promises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DAZZLE_DENTAL_KNOWLEDGE.priceRanges.map((pr, idx) => (
              <div
                key={idx}
                className="bg-[#12151a] border border-[#242932] rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-[#c9a84c]/40 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c]">
                    Procedure {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-[#f3efe7] mt-1 mb-2">
                    {pr.procedure}
                  </h3>
                  <div className="text-2xl font-serif font-bold text-[#f3e2a9] mb-2">
                    {pr.range}
                  </div>
                  <p className="text-xs text-[#9aa0aa] leading-relaxed">
                    {pr.note}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsChatOpen(true);
                    setTimeout(() => {
                      handleSendMessage(`Can you explain the procedure and travel timeframe for ${pr.procedure}?`);
                    }, 200);
                  }}
                  className="w-full py-2 px-3 bg-[#161a20] hover:bg-[#242932] text-xs font-semibold text-[#f3efe7] rounded-lg border border-[#242932] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span>Ask Aria About This</span>
                </button>
              </div>
            ))}
          </div>

          {/* International Patient Travel Amenities Bar */}
          <div className="mt-10 bg-[#161a20] border border-[#242932] rounded-2xl p-6 sm:p-8">
            <h4 className="text-base font-bold text-[#f3efe7] mb-4 flex items-center gap-2">
              <Hotel className="w-4 h-4 text-[#c9a84c]" />
              International Patient Care Amenities Embedded in Aria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-[#9aa0aa]">
              {DAZZLE_DENTAL_KNOWLEDGE.internationalPerks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[#f3efe7]/90">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRD §8: ROI Engine Section */}
      <section id="roi-engine" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ClinicRoiCalculator onTryDemo={() => setIsChatOpen(true)} />
        </div>
      </section>

      {/* TRD §9: Guardrail Testing Section */}
      <section id="guardrails" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0e1115] border-t border-[#242932]/70">
        <div className="max-w-7xl mx-auto">
          <GuardrailTester onRunTest={handleRunGuardrailTest} />
        </div>
      </section>

      {/* Architecture & Cloudflare Worker Explanation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#242932]">
        <div className="max-w-5xl mx-auto bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#f3efe7]">TRD §1 Architecture: Secret-Holding Worker Proxy</h3>
              <p className="text-xs text-[#9aa0aa]">Why production routes through Cloudflare rather than browser client</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#9aa0aa] leading-relaxed">
            Placing an API key inside client-side JavaScript on a public GitHub Pages site would cause it to be scraped within minutes. In production, this landing page dispatches requests to a <strong className="text-[#f3efe7]">Cloudflare Worker</strong> that holds the encrypted <code className="text-[#f3e2a9] bg-black/40 px-1 py-0.5 rounded">GROQ_API_KEY</code>, rate-limits per IP, injects the verbatim system prompt server-side, and dispatches webhooks to Google Sheets/CRM.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 bg-[#242932] hover:bg-[#323946] text-xs font-semibold text-[#f3efe7] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>View Standalone index.html & worker.js Source</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-[#161a20] border border-[#242932] hover:border-[#c9a84c]/50 text-xs font-semibold text-[#9aa0aa] hover:text-[#f3efe7] rounded-lg transition-colors"
            >
              <span>Demo Settings & Groq Model</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#242932] bg-[#090b0e] text-center text-xs text-[#9aa0aa] space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#f3efe7]">Dazzle Dental · Aria Concierge</span>
            <span className="text-[#9aa0aa]">|</span>
            <span>Proof of Work Sales Demo</span>
          </div>

          <p>
            Architecture by <strong className="text-[#f3efe7]">Anurag Jaiswar</strong> (Nexus Web Systems / GTM Engineer) · PRD v1.0
          </p>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-[#f3e2a9] transition-colors">
              Groq Settings
            </button>
            <button onClick={() => setIsLeadDrawerOpen(true)} className="hover:text-[#f3e2a9] transition-colors">
              CRM Extractor
            </button>
            <button onClick={() => setIsExportModalOpen(true)} className="hover:text-[#f3e2a9] transition-colors">
              Export Code
            </button>
          </div>
        </div>
      </footer>

      {/* Aria Floating Chat Concierge Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeadDrawer={() => setIsLeadDrawerOpen(true)}
        onResetChat={handleResetChat}
        variant={variant}
        groqKeyActive={Boolean(groqSettings.apiKey && groqSettings.apiKey.length > 5)}
      />

      {/* Live Extracted Lead Record Drawer */}
      <LeadExtractorDrawer
        isOpen={isLeadDrawerOpen}
        onClose={() => setIsLeadDrawerOpen(false)}
        leadRecord={leadRecord}
        messages={messages}
      />

      {/* Groq Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={groqSettings}
        onSave={(newSettings) => setGroqSettings(newSettings)}
      />

      {/* Deploy & Export Standalone Code Modal */}
      <DeployExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
