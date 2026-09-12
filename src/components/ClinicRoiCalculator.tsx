import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Shield, Sparkles, ArrowRight } from 'lucide-react';

export const ClinicRoiCalculator: React.FC<{ onTryDemo: () => void }> = ({ onTryDemo }) => {
  const [monthlyAfterHoursInquiries, setMonthlyAfterHoursInquiries] = useState(25);
  const [avgCaseValue, setAvgCaseValue] = useState(7500);
  const [recoveredConversionRate, setRecoveredConversionRate] = useState(12); // 12%

  const casesRecoveredMonthly = Math.max(1, Math.round((monthlyAfterHoursInquiries * (recoveredConversionRate / 100))));
  const monthlyRevenueRecovered = casesRecoveredMonthly * avgCaseValue;
  const annualRevenueRecovered = monthlyRevenueRecovered * 12;

  // Groq + Aria estimated monthly operational cost (~$120/mo inference & hosting)
  const estimatedCost = 250;
  const netRoiRatio = Math.round(monthlyRevenueRecovered / estimatedCost);

  return (
    <div className="bg-[#12151a] border border-[#242932] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Subtle gold gradient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 text-[#f3e2a9] text-xs font-semibold uppercase tracking-wider mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          Founder Pitch ROI Engine
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#f3efe7] mb-3">
          Calculate Revenue Lost to 2AM Response Delays
        </h3>
        <p className="text-sm text-[#9aa0aa] mb-8 leading-relaxed">
          International dental tourists inquire at 11pm–4am in your clinic’s local timezone. A 12-hour delay cut close rates by over 60%. Aria recovers cases your front desk never even saw.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Input */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: After-Hours Inquiries */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#f3efe7] font-medium">Estimated Monthly After-Hours Inquiries</span>
              <span className="font-bold text-[#f3e2a9]">{monthlyAfterHoursInquiries} patients / mo</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={monthlyAfterHoursInquiries}
              onChange={(e) => setMonthlyAfterHoursInquiries(Number(e.target.value))}
              className="w-full accent-[#c9a84c] bg-[#161a20] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#9aa0aa]">
              <span>5 inquiries</span>
              <span>50 inquiries</span>
              <span>100 inquiries</span>
            </div>
          </div>

          {/* Slider 2: Average Case Value */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#f3efe7] font-medium">Average International Case Value</span>
              <span className="font-bold text-[#f3e2a9]">${avgCaseValue.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={avgCaseValue}
              onChange={(e) => setAvgCaseValue(Number(e.target.value))}
              className="w-full accent-[#c9a84c] bg-[#161a20] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#9aa0aa]">
              <span>$2,000 (Simple)</span>
              <span>$10,000 (Veneers)</span>
              <span>$25,000 (All-on-4/6)</span>
            </div>
          </div>

          {/* Slider 3: Conversion recovery rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#f3efe7] font-medium">Expected Close Rate on Instant Responses</span>
              <span className="font-bold text-[#f3e2a9]">{recoveredConversionRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={recoveredConversionRate}
              onChange={(e) => setRecoveredConversionRate(Number(e.target.value))}
              className="w-full accent-[#c9a84c] bg-[#161a20] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#9aa0aa]">
              <span>5% conservative</span>
              <span>12% standard</span>
              <span>30% high-intent</span>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="lg:col-span-5 bg-[#161a20] border border-[#c9a84c]/30 rounded-xl p-6 relative">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#9aa0aa]">Monthly Pipeline Recovered</p>
              <h4 className="text-3xl sm:text-4xl font-serif font-bold text-[#f3e2a9] mt-1">
                +${monthlyRevenueRecovered.toLocaleString()}
                <span className="text-xs font-sans text-[#9aa0aa] font-normal"> / month</span>
              </h4>
            </div>

            <div className="pt-3 border-t border-[#242932] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#9aa0aa]">Additional Cases Closed:</span>
                <span className="font-semibold text-[#f3efe7]">+{casesRecoveredMonthly} cases/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#9aa0aa]">Annual Revenue Impact:</span>
                <span className="font-bold text-emerald-400">+${annualRevenueRecovered.toLocaleString()} / yr</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#9aa0aa]">Est. ROI on Retainer:</span>
                <span className="font-bold text-[#f3e2a9]">{netRoiRatio}x return</span>
              </div>
            </div>

            <button
              onClick={onTryDemo}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#c9a84c]/20"
            >
              <span>Test Aria Live on This Model</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
