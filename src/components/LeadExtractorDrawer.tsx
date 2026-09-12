import React from 'react';
import { X, Database, ShieldAlert, CheckCircle2, Clock, User, Globe2, DollarSign, Calendar, Phone, Sparkles, Download, Copy } from 'lucide-react';
import { LeadRecord, ChatMessage } from '../types';

interface LeadExtractorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leadRecord: LeadRecord;
  messages: ChatMessage[];
}

export const LeadExtractorDrawer: React.FC<LeadExtractorDrawerProps> = ({
  isOpen,
  onClose,
  leadRecord,
  messages,
}) => {
  if (!isOpen) return null;

  const userMessages = messages.filter(m => m.role === 'user');

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(leadRecord, null, 2));
    alert('Lead Record JSON copied to clipboard!');
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leadRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dazzle-lead-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        id="lead-crm-drawer"
        className="w-full max-w-md bg-[#12151a] border-l border-[#242932] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#242932] bg-[#161a20] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f3efe7]">Live Lead Capture CRM</h2>
              <p className="text-xs text-[#9aa0aa]">PRD §8 Structured Data Extractor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9aa0aa] hover:text-[#f3efe7] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Overview Status */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          <div className="bg-[#161a20] border border-[#242932] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0aa]">Qualification Tier</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                leadRecord.qualificationStatus === 'Fully Qualified'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : leadRecord.qualificationStatus === 'Partially Qualified'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {leadRecord.qualificationStatus}
              </span>
            </div>
            <p className="text-xs text-[#9aa0aa]">
              Aria automatically extracts structured parameters conversationally without forcing the visitor through a robotic webform.
            </p>
          </div>

          {/* Extracted Fields Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a84c] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Extracted Lead Fields
            </h3>

            {/* Field 1: Patient Name */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <User className="w-4 h-4 text-[#c9a84c]" />
                <span>Patient Name</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7]">
                {leadRecord.name || <span className="text-[#9aa0aa]/50 italic">Not mentioned yet</span>}
              </span>
            </div>

            {/* Field 2: Home Country / Timezone */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <Globe2 className="w-4 h-4 text-[#c9a84c]" />
                <span>Country / Timezone</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7]">
                {leadRecord.homeCountry || <span className="text-[#9aa0aa]/50 italic">Pending location</span>}
              </span>
            </div>

            {/* Field 3: Procedure Interest */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <Sparkles className="w-4 h-4 text-[#c9a84c]" />
                <span>Procedure Interest</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7] text-right">
                {leadRecord.procedureInterest || <span className="text-[#9aa0aa]/50 italic">Exploring</span>}
              </span>
            </div>

            {/* Field 4: Budget Band */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <DollarSign className="w-4 h-4 text-[#c9a84c]" />
                <span>Budget Band</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7]">
                {leadRecord.budgetBand || <span className="text-[#9aa0aa]/50 italic">Not specified</span>}
              </span>
            </div>

            {/* Field 5: Travel Timeframe */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <Calendar className="w-4 h-4 text-[#c9a84c]" />
                <span>Travel Window</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7]">
                {leadRecord.travelTimeframe || <span className="text-[#9aa0aa]/50 italic">Flexible / Unknown</span>}
              </span>
            </div>

            {/* Field 6: Contact Method */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <Phone className="w-4 h-4 text-[#c9a84c]" />
                <span>Preferred Contact</span>
              </div>
              <span className="text-xs font-semibold text-[#f3efe7]">
                {leadRecord.preferredContact || <span className="text-[#9aa0aa]/50 italic">Awaiting details</span>}
              </span>
            </div>

            {/* Field 7: Escalation Flag */}
            <div className="p-3 bg-[#161a20] border border-[#242932] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-[#9aa0aa]">
                <ShieldAlert className="w-4 h-4 text-[#c9a84c]" />
                <span>Escalated to Human</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                leadRecord.escalationFlag
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-800 text-[#9aa0aa]'
              }`}>
                {leadRecord.escalationFlag ? 'YES (Active)' : 'NO'}
              </span>
            </div>
          </div>

          {/* Conversation Statistics */}
          <div className="p-4 bg-[#161a20] border border-[#242932] rounded-xl space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9aa0aa]">Conversation Metrics</h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[11px] text-[#9aa0aa]">Total Turns</p>
                <p className="text-base font-bold text-[#f3efe7]">{messages.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9aa0aa]">User Messages</p>
                <p className="text-base font-bold text-[#f3efe7]">{userMessages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#161a20] border-t border-[#242932] grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#242932] hover:bg-[#323946] text-xs font-semibold text-[#f3efe7] rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSON</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] text-xs font-bold rounded-lg hover:brightness-110 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
