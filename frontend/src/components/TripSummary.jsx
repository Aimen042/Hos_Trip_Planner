import React from 'react';
import { Route, Clock, Calendar, Battery, ArrowUpRight } from 'lucide-react';

export default function TripSummary({ summary }) {
  if (!summary) return null;

  const cycleUsed = summary.final_cycle_hours_used || 0;
  const cycleRemaining = Math.max(0, 70.0 - cycleUsed);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      
      {/* Metric 1: Total Miles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Total Distance</span>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Route className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{summary.total_miles} <span className="text-xs text-slate-500 font-sans font-normal">mi</span></div>
        <p className="text-[11px] text-slate-500 mt-1">Geocoded road mileage</p>
      </div>

      {/* Metric 2: Driving Time */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Driving Time</span>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{summary.total_driving_hours} <span className="text-xs text-slate-500 font-sans font-normal">hrs</span></div>
        <p className="text-[11px] text-slate-500 mt-1">Behind-the-wheel time</p>
      </div>

      {/* Metric 3: Total Trip Duration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Elapsed Duration</span>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{summary.total_trip_duration_hours} <span className="text-xs text-slate-500 font-sans font-normal">hrs</span></div>
        <p className="text-[11px] text-slate-500 mt-1">Incl. resets & rest breaks</p>
      </div>

      {/* Metric 4: Days / Daily Logs Required */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Log Sheets</span>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{summary.total_days_required} <span className="text-xs text-slate-500 font-sans font-normal">{summary.total_days_required === 1 ? 'Sheet' : 'Sheets'}</span></div>
        <p className="text-[11px] text-slate-500 mt-1">24-Hr period daily logs</p>
      </div>

      {/* Metric 5: Cycle Hours Remaining */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Cycle Remaining</span>
          <div className={`p-1.5 rounded-lg ${cycleRemaining < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Battery className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{cycleRemaining.toFixed(1)} <span className="text-xs text-slate-500 font-sans font-normal">/ 70.0 h</span></div>
        <p className="text-[11px] text-slate-500 mt-1">Rolling 8-day availability</p>
      </div>

    </div>
  );
}
