import React from 'react';
import TripSummary from './TripSummary';
import HOSStatsWidget from './HOSStatsWidget';
import RouteMap from './RouteMap';
import LogSheetViewer from './LogSheet/LogSheetViewer';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResultsScreen({ tripPlan, onReset }) {
  if (!tripPlan) return null;

  return (
    <div className="space-y-6 animate-fade-in py-2">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs text-white bg-[#031636] hover:bg-[#052252] px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Plan Another Trip</span>
          </button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h2 className="text-base text-slate-900 font-medium">Trip Results & Daily Log Sheets</h2>
            <p className="text-xs text-slate-500">Route from {tripPlan.inputs.current_location} → {tripPlan.inputs.pickup_location} → {tripPlan.inputs.dropoff_location}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>49 CFR § 395 Verified</span>
        </div>
      </div>

      {/* KPI Metrics */}
      <TripSummary summary={tripPlan.summary} />

      {/* HOS Compliance Clock Breakdown */}
      <HOSStatsWidget summary={tripPlan.summary} timeline={tripPlan.timeline} />

      {/* Interactive Route Map & Waypoint Stop Rationale */}
      <RouteMap route={tripPlan.route} stops={tripPlan.stops} />

      {/* FMCSA Electronic Daily Log Sheets */}
      <LogSheetViewer dailyLogs={tripPlan.daily_logs} />

    </div>
  );
}
