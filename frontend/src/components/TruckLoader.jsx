import React, { useEffect, useState } from 'react';
import { Truck, MapPin, ShieldCheck, FileText } from 'lucide-react';

const LOADING_STEPS = [
  { label: 'Geocoding trip locations & highway route...', icon: MapPin },
  { label: 'Calculating mandatory 49 CFR Part 395 rest breaks...', icon: ShieldCheck },
  { label: 'Generating 24-hour Daily Log Sheets...', icon: FileText }
];

export default function TruckLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 700);
    const timer2 = setTimeout(() => setCurrentStep(2), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const StepIcon = LOADING_STEPS[currentStep].icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Animated Truck Graphic */}
      <div className="relative mb-8 w-72">
        {/* Moving Truck Icon (#031636 Theme) */}
        <div className="animate-truck-drive flex justify-center mb-2">
          <div className="bg-[#031636] text-white p-4 rounded-2xl shadow-xl inline-flex items-center justify-center">
            <Truck className="w-12 h-12" />
          </div>
        </div>

        {/* Moving Highway Road Line */}
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative border border-slate-300">
          <div className="h-full w-full animate-road-move"></div>
        </div>
        
        {/* Wheels shadow glow */}
        <div className="w-24 h-1.5 bg-slate-300 rounded-full mx-auto mt-2 blur-xs"></div>
      </div>

      {/* Loading Status Text */}
      <div className="max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
        <div className="flex items-center justify-center space-x-2 text-[#031636] mb-2">
          <StepIcon className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Processing Trip Plan...</span>
        </div>

        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {LOADING_STEPS[currentStep].label}
        </h3>
        <p className="text-xs text-slate-500">
          Enforcing 11h driving cap, 14h shift window, 30m rest breaks, & 70h cycle rules
        </p>

        {/* Step Indicators */}
        <div className="flex justify-center items-center space-x-2 mt-5">
          {LOADING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx <= currentStep ? 'w-8 bg-[#031636]' : 'w-2 bg-slate-200'
              }`}
            ></div>
          ))}
        </div>
      </div>

    </div>
  );
}
