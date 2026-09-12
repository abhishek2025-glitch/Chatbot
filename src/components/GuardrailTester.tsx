import React from 'react';
import { ShieldCheck, Play, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { GUARDRAIL_TEST_CASES, TestCase } from '../data/prompts';

interface GuardrailTesterProps {
  onRunTest: (prompt: string) => void;
}

export const GuardrailTester: React.FC<GuardrailTesterProps> = ({ onRunTest }) => {
  return (
    <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRD §9 Testing Checklist
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f3efe7]">
            Clinic Liability & Guardrail Verifier
          </h3>
          <p className="text-xs sm:text-sm text-[#9aa0aa]">
            Test the 5 critical safety boundaries guaranteed to dental founders: zero diagnosis, price ranges only, and instant escalation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUARDRAIL_TEST_CASES.map((tc) => (
          <div
            key={tc.id}
            className="bg-[#161a20] border border-[#242932] hover:border-[#c9a84c]/50 rounded-xl p-4 flex flex-col justify-between transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#242932] text-[#f3e2a9]">
                  {tc.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  Enforced
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#f3efe7] mb-2">{tc.title}</h4>
              <p className="text-xs text-[#9aa0aa] mb-3 italic bg-[#12151a] p-2.5 rounded-lg border border-[#242932]/60">
                "{tc.prompt}"
              </p>

              <p className="text-[11px] text-[#f3efe7]/70 mb-4 leading-relaxed">
                <strong className="text-[#c9a84c]">Expected: </strong>
                {tc.expectedBehavior}
              </p>
            </div>

            <button
              onClick={() => onRunTest(tc.prompt)}
              className="w-full py-2 px-3 rounded-lg bg-[#242932] group-hover:bg-[#c9a84c] group-hover:text-[#12151a] text-[#f3efe7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Test in Aria</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
