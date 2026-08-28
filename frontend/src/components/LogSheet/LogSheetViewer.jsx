import React, { useState } from 'react';
import LogSheetSVG from './LogSheetSVG';
import { Calendar, ChevronLeft, ChevronRight, Printer, FileText } from 'lucide-react';

export default function LogSheetViewer({ dailyLogs }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [signatures, setSignatures] = useState({});

  if (!dailyLogs || dailyLogs.length === 0) return null;

  const activeLog = dailyLogs[activeDayIndex] || dailyLogs[0];

  const handlePrint = () => {
    window.print();
  };

  const handleSign = (dataUrl) => {
    setSignatures(prev => ({ ...prev, [activeLog.day_number]: dataUrl }));
  };

  const handleClearSignature = () => {
    setSignatures(prev => {
      const next = { ...prev };
      delete next[activeLog.day_number];
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
      
      {/* Header Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0e1f37]" />
            Official FMCSA ELD Daily Log Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-filled 24-Hour Record of Duty Status (RODS) step-function grids ({dailyLogs.length} total {dailyLogs.length === 1 ? 'day' : 'days'})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export Log Sheet</span>
          </button>
        </div>
      </div>

      {/* Day Pagination Tab Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-2 rounded-xl border border-slate-200">
        
        <div className="flex items-center space-x-2 overflow-x-auto">
          {dailyLogs.map((log, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDayIndex === idx
                  ? 'bg-[#0e1f37] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-white hover:bg-[#0e1f37]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {log.day_number} ({log.date})</span>
            </button>
          ))}
        </div>

        {/* Prev / Next Pagination */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            disabled={activeDayIndex === 0}
            onClick={() => setActiveDayIndex(prev => Math.max(0, prev - 1))}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-600 font-mono font-medium">
            {activeDayIndex + 1} of {dailyLogs.length}
          </span>
          <button
            disabled={activeDayIndex === dailyLogs.length - 1}
            onClick={() => setActiveDayIndex(prev => Math.min(dailyLogs.length - 1, prev + 1))}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Region — LogSheetSVG's root div already carries the
          .print-log-container class that index.css targets for print isolation */}
      <LogSheetSVG
        log={activeLog}
        signature={signatures[activeLog.day_number]}
        onSign={handleSign}
        onClearSignature={handleClearSignature}
      />

    </div>
  );
}
