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
    const ratio = window.devicePixelRatio || 1;

    // Re-sizes the canvas's internal pixel buffer to match its current
    // on-screen size. Runs on mount AND whenever the canvas's rendered size
    // changes (via ResizeObserver below) — not just once — because when
    // multiple days' log sheets are all mounted at once (for printing) but
    // only the active day is visible, an inactive day's canvas starts out
    // with offsetWidth/offsetHeight of 0 (its parent is display:none). A
    // one-time-on-mount sizing would permanently lock that canvas at 0x0,
    // so switching to that tab later and signing would silently capture
    // nothing. Re-measuring on every visibility/size change fixes that.
    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width === 0 || height === 0) return; // still hidden — skip
      // Setting width/height resets the canvas's pixel buffer AND its
      // transform back to identity, so re-applying scale() here each time
      // is safe and never compounds.
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
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

    // Crop the exported PNG down to the actual bounding box of the drawn
    // ink (plus a small margin) instead of exporting the whole (mostly
    // blank) canvas. This is what makes the printed signature show only
    // the pen strokes, tightly framed, rather than a large mostly-empty box.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const { data } = ctx.getImageData(0, 0, width, height);

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) {
      onSign(canvas.toDataURL('image/png'));
      return;
    }

    const padding = 6;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    croppedCanvas
      .getContext('2d')
      .drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    onSign(croppedCanvas.toDataURL('image/png'));
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
          className="text-[11px] font-semibold text-white bg-[#0d1e35] hover:bg-[#08386b] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded-md cursor-pointer"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
