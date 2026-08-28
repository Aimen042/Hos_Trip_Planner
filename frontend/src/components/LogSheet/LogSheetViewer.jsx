import React, { useState } from 'react';
import LogSheetSVG from './LogSheetSVG';
import { Calendar, ChevronLeft, ChevronRight, Printer, FileText } from 'lucide-react';

export default function LogSheetViewer({ dailyLogs }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [signatures, setSignatures] = useState({});
  const [certifications, setCertifications] = useState({});

  if (!dailyLogs || dailyLogs.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSign = (dayNumber) => (dataUrl) => {
    setSignatures(prev => ({ ...prev, [dayNumber]: dataUrl }));
  };

  const handleClearSignature = (dayNumber) => () => {
    setSignatures(prev => {
      const next = { ...prev };
      delete next[dayNumber];
      return next;
    });
  };

  const handleToggleCertify = (dayNumber) => (checked) => {
    setCertifications(prev => ({ ...prev, [dayNumber]: checked }));
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

      {/* Printable Region — on screen only the active day's log sheet is
          shown (matching the tab bar above), but for printing ALL days are
          rendered so a multi-day trip's full log set gets printed, not just
          the currently-selected tab. Each day's LogSheetSVG root div carries
          the .print-log-container class that index.css targets for print
          isolation, and .log-day-page forces a page break between days. */}
      {dailyLogs.map((log, idx) => (
        <div
          key={log.day_number ?? idx}
          className={`log-day-page ${idx === activeDayIndex ? 'block' : 'hidden print:block'}`}
        >
          <LogSheetSVG
            log={log}
            signature={signatures[log.day_number]}
            onSign={handleSign(log.day_number)}
            onClearSignature={handleClearSignature(log.day_number)}
            certified={certifications[log.day_number]}
            onToggleCertify={handleToggleCertify(log.day_number)}
          />
        </div>
      ))}

    </div>
  );
}
