import React from 'react';
import SignaturePad from './SignaturePad';
import { RotateCcw } from 'lucide-react';

const ROW_HEIGHT = 38;
const GRID_WIDTH = 760;
const GRID_HEIGHT = ROW_HEIGHT * 4;
const LEFT_MARGIN = 140;
const RIGHT_TOTALS_WIDTH = 70;

const ROW_LABELS = [
  '1. Off Duty',
  '2. Sleeper Berth',
  '3. Driving',
  '4. On Duty (not driving)'
];

const Y_CENTERS = [
  ROW_HEIGHT * 0.5,
  ROW_HEIGHT * 1.5,
  ROW_HEIGHT * 2.5,
  ROW_HEIGHT * 3.5
];

// Converts decimal hours (e.g. 14.67) into HH:MM format (e.g. "14:40")
function formatHoursToHHMM(decimalHours) {
  const totalMinutes = Math.round((decimalHours || 0) * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export default function LogSheetSVG({ log, signature, onSign, onClearSignature, certified, onToggleCertify }) {
  if (!log) return null;

  const {
    date,
    day_number,
    total_miles_today,
    carrier_name,
    main_office_address,
    truck_number,
    driver_name,
    home_terminal_address,
    entries = [],
    totals = {},
    remarks = []
  } = log;

  // Sum of all 4 duty-status totals for the "Total Hours Today" checksum footer
  const totalSumHours = Object.values(totals).reduce((sum, v) => sum + (v || 0), 0);

  // Build continuous step-function path
  let pathD = '';
  let prevY = null;

  entries.forEach((entry, idx) => {
    const xStart = LEFT_MARGIN + (entry.start_minute / 1440.0) * GRID_WIDTH;
    const xEnd = LEFT_MARGIN + (entry.end_minute / 1440.0) * GRID_WIDTH;
    const statusCode = entry.status_code || 1;
    const yVal = Y_CENTERS[statusCode - 1];

    if (idx === 0) {
      pathD += `M ${xStart} ${yVal} `;
    } else if (prevY !== null && prevY !== yVal) {
      pathD += `L ${xStart} ${yVal} `;
    }

    pathD += `L ${xEnd} ${yVal} `;
    prevY = yVal;
  });

  return (
    <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-sm border border-slate-300 font-sans max-w-5xl mx-auto overflow-x-auto my-4 print-log-container">
      
      {/* Official Form Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
          <div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Form FMCSA-395.8 Compliant</span>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">DRIVER'S DAILY LOG</h2>
            <p className="text-xs text-slate-600 font-medium">(ONE CALENDAR DAY — 24 HOURS)</p>
          </div>

          {/* Date & Miles Header Box */}
          <div className="flex gap-4 border border-slate-800 p-2.5 rounded-lg bg-slate-50">
            <div>
              <span className="text-[9px] uppercase font-medium text-slate-500 block">Date (Month/Day/Year)</span>
              <span className="text-xs font-semibold font-mono text-blue-700">{date}</span>
            </div>
            <div className="border-l border-slate-300 pl-3">
              <span className="text-[9px] uppercase font-medium text-slate-500 block">Total Miles Driving Today</span>
              <span className="text-xs font-semibold font-mono text-emerald-700">{total_miles_today} mi</span>
            </div>
            <div className="border-l border-slate-300 pl-3">
              <span className="text-[9px] uppercase font-medium text-slate-500 block">Day #</span>
              <span className="text-xs font-semibold font-mono text-slate-800">Day {day_number}</span>
            </div>
          </div>
        </div>

        {/* Carrier Info Subheaders */}
        <div className="log-header-grid grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mt-3 pt-2 border-t border-slate-200">
          <div>
            <span className="text-[10px] font-medium text-slate-500 block uppercase">Name of Driver:</span>
            <span className="font-normal text-slate-900">{driver_name}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 block uppercase">Name of Carrier:</span>
            <span className="font-normal text-slate-900">{carrier_name}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 block uppercase">Main Office Address:</span>
            <span className="font-normal text-slate-900">{main_office_address}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-500 block uppercase">Truck/Trailer Numbers:</span>
            <span className="font-normal text-slate-900">{truck_number}</span>
          </div>
        </div>
      </div>

      {/* SVG 24-Hour Graph Grid */}
      <div className="my-4">
        <svg
          viewBox={`0 0 ${LEFT_MARGIN + GRID_WIDTH + RIGHT_TOTALS_WIDTH} ${GRID_HEIGHT + 65}`}
          className="w-full h-auto select-none"
        >
          {/* Header Hour Markers */}
          <rect x={LEFT_MARGIN} y={0} width={GRID_WIDTH} height={22} fill="#0f172a" />
          <text x={LEFT_MARGIN - 10} y={15} textAnchor="end" fill="#0f172a" fontSize="10" fontWeight="500">Midnight</text>

          {[...Array(25)].map((_, i) => {
            const x = LEFT_MARGIN + (i / 24.0) * GRID_WIDTH;
            let hourText = i === 0 || i === 24 ? 'M' : i === 12 ? 'Noon' : i > 12 ? i - 12 : i;
            return (
              <g key={i}>
                <text x={x} y={15} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="500">
                  {hourText}
                </text>
              </g>
            );
          })}

          {/* Right Column Header */}
          <rect x={LEFT_MARGIN + GRID_WIDTH} y={0} width={RIGHT_TOTALS_WIDTH} height={22} fill="#0f172a" />
          <text x={LEFT_MARGIN + GRID_WIDTH + 35} y={15} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="500">
            Total Hours
          </text>

          {/* 4 Duty Status Rows */}
          {ROW_LABELS.map((label, idx) => {
            const y = 22 + idx * ROW_HEIGHT;
            const yCenter = 22 + Y_CENTERS[idx];
            const isEven = idx % 2 === 0;

            return (
              <g key={idx}>
                {/* Row Background */}
                <rect
                  x={LEFT_MARGIN}
                  y={y}
                  width={GRID_WIDTH}
                  height={ROW_HEIGHT}
                  fill={isEven ? '#f8fafc' : '#ffffff'}
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                />

                {/* Left Label */}
                <rect x={0} y={y} width={LEFT_MARGIN - 4} height={ROW_HEIGHT} fill="#f1f5f9" rx="3" />
                <text
                  x={LEFT_MARGIN - 10}
                  y={yCenter + 4}
                  textAnchor="end"
                  fill="#1e293b"
                  fontSize="11"
                  fontWeight="500"
                >
                  {label}
                </text>

                {/* Hour Vertical Grid Lines & 15-Min Ticks */}
                {[...Array(96)].map((_, tickIdx) => {
                  const xTick = LEFT_MARGIN + (tickIdx / 96.0) * GRID_WIDTH;
                  const isHour = tickIdx % 4 === 0;
                  const isHalfHour = tickIdx % 2 === 0;

                  return (
                    <line
                      key={tickIdx}
                      x1={xTick}
                      y1={y}
                      x2={xTick}
                      y2={y + (isHour ? ROW_HEIGHT : isHalfHour ? ROW_HEIGHT * 0.5 : ROW_HEIGHT * 0.25)}
                      stroke={isHour ? '#94a3b8' : '#cbd5e1'}
                      strokeWidth={isHour ? '1' : '0.5'}
                    />
                  );
                })}

                {/* Right Total Box */}
                <rect
                  x={LEFT_MARGIN + GRID_WIDTH}
                  y={y}
                  width={RIGHT_TOTALS_WIDTH}
                  height={ROW_HEIGHT}
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                />
                <text
                  x={LEFT_MARGIN + GRID_WIDTH + 35}
                  y={yCenter + 4}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="500"
                  fontFamily="monospace"
                >
                  {formatHoursToHHMM(totals[Object.keys(totals)[idx]])}
                </text>
              </g>
            );
          })}

          {/* Stepped Line (Step Function Path) */}
          <path
            d={pathD}
            transform="translate(0, 22)"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom Grid Axis Line */}
          <line
            x1={LEFT_MARGIN}
            y1={22 + GRID_HEIGHT}
            x2={LEFT_MARGIN + GRID_WIDTH + RIGHT_TOTALS_WIDTH}
            y2={22 + GRID_HEIGHT}
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Sum Total Check (24.0 Hrs) */}
          <rect
            x={LEFT_MARGIN + GRID_WIDTH}
            y={22 + GRID_HEIGHT + 4}
            width={RIGHT_TOTALS_WIDTH}
            height={26}
            fill="#dcfce7"
            stroke="#16a34a"
            strokeWidth="1.5"
            rx="4"
          />
          <text
            x={LEFT_MARGIN + GRID_WIDTH + 35}
            y={22 + GRID_HEIGHT + 21}
            textAnchor="middle"
            fill="#15803d"
            fontSize="12"
            fontWeight="600"
            fontFamily="monospace"
          >
            = {formatHoursToHHMM(totalSumHours)}
          </text>
          <text
            x={LEFT_MARGIN + GRID_WIDTH - 10}
            y={22 + GRID_HEIGHT + 20}
            textAnchor="end"
            fill="#0f172a"
            fontSize="11"
            fontWeight="500"
          >
            Total Hours Today:
          </text>
        </svg>
      </div>

      {/* Remarks Section */}
      <div className="mt-6 border-t-2 border-slate-900 pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 mb-2.5">
          REMARKS (City, State logged at each duty status change point):
        </h3>
        
        {remarks && remarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {remarks.map((rem, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-normal">{rem.time}</span>
                <div>
                  <strong className="text-blue-700 block text-[11px] font-medium">{rem.location}</strong>
                  <span className="text-slate-600 text-[11px]">{rem.remark}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No duty status changes logged for this 24-hour period.</p>
        )}
      </div>

      {/* Driver Signature Footer */}
      <div className="log-signature-footer mt-6 pt-4 border-t border-slate-300 flex flex-wrap justify-between items-end text-xs">
        <div className="w-64">
          <span className="text-[10px] font-medium text-slate-500 block uppercase mb-1">Driver Signature (Certification)</span>

          {signature ? (
            <div className="border-b-2 border-slate-800 pb-1">
              <img src={signature} alt="Driver signature" className="log-signature-img h-12 object-contain" />
              <button
                type="button"
                onClick={onClearSignature}
                className="print:hidden flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600 mt-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear / re-sign
              </button>
            </div>
          ) : (
            <div className="print:hidden">
              <SignaturePad onSign={onSign} />
            </div>
          )}

          <label className="flex items-start gap-1.5 mt-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!certified}
              onChange={(e) => onToggleCertify && onToggleCertify(e.target.checked)}
              className="mt-0.5 h-3 w-3 accent-blue-700 cursor-pointer shrink-0"
            />
            <span className="text-[9px] text-slate-500 block">I certify these entries are true and correct</span>
          </label>
        </div>

        <div>
          <span className="text-[10px] font-medium text-slate-500 block uppercase">Home Terminal Address</span>
          <span className="font-normal text-slate-700">{home_terminal_address}</span>
        </div>
      </div>

    </div>
  );
}
