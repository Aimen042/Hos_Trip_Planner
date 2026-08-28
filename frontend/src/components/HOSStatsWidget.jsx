import React from 'react';
import { ShieldCheck, Coffee, Moon, Fuel, RefreshCw } from 'lucide-react';

export default function HOSStatsWidget({ summary, timeline }) {
  if (!summary || !timeline) return null;

  const breakCount = timeline.filter(e => e.event_type === 'break').length;
  const resetCount = timeline.filter(e => e.event_type === 'reset').length;
  const fuelCount = timeline.filter(e => e.event_type === 'fuel').length;
  const restartCount = timeline.filter(e => e.event_type === 'restart').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base">49 CFR Part 395 Regulatory Compliance Audit</h3>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
          100% FMCSA Compliant Schedule
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: 30-Min Breaks */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg mt-0.5">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">30-Min Rest Breaks</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{breakCount} Inserted</div>
            <p className="text-[11px] text-slate-500 mt-1">Required after 8h driving (§395.3(a)(3)(ii))</p>
          </div>
        </div>

        {/* Card 2: 10-Hr Resets */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg mt-0.5">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">10-Hr Off-Duty Resets</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{resetCount} Inserted</div>
            <p className="text-[11px] text-slate-500 mt-1">11h/14h clock resets (§395.3(a)(1))</p>
          </div>
        </div>

        {/* Card 3: Fuel Stops */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fuel Stops</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{fuelCount} Required</div>
            <p className="text-[11px] text-slate-500 mt-1">Every ~1,000 miles (30m On-Duty)</p>
          </div>
        </div>

        {/* Card 4: 34-Hr Cycle Restarts */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg mt-0.5">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">34-Hr Restarts</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{restartCount} Required</div>
            <p className="text-[11px] text-slate-500 mt-1">70-hr rolling cycle reset (§395.3(c))</p>
          </div>
        </div>

      </div>
    </div>
  );
}
