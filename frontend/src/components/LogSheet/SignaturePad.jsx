import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, PenLine } from 'lucide-react';

/**
 * SignaturePad
 * A lightweight canvas-based signature capture component — no external
 * dependencies. Supports mouse and touch input. On save, the drawing is
 * exported as a PNG data URL and handed to the parent via onSign(dataUrl),
 * so the parent can store a static image (reliable for printing) instead
 * of keeping a live <canvas> around.
 */
export default function SignaturePad({ onSign }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Scale for crisp lines on high-DPI screens
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    hasDrawn.current = true;
    setIsEmpty(false);
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (!hasDrawn.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSign(dataUrl);
  };

  return (
    <div className="w-64">
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <canvas
          ref={canvasRef}
          className="w-full h-20 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <PenLine className="w-3.5 h-3.5" /> Sign here with mouse or finger
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="text-[11px] font-semibold text-white bg-[#0d1d35] hover:bg-[#073370] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded-md cursor-pointer"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
