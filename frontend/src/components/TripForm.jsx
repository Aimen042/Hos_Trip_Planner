import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Play, Sparkles, AlertCircle, Info, ChevronRight, HelpCircle } from 'lucide-react';
import { PRESET_TRIPS } from '../mock/presetTrips';

export default function TripForm({ onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    current_location: 'Chicago, IL',
    pickup_location: 'St. Louis, MO',
    dropoff_location: 'Dallas, TX',
    current_cycle_used_hrs: '15.0'
  });

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSelectPreset = (preset) => {
    setFormData({
      current_location: preset.current_location,
      pickup_location: preset.pickup_location,
      dropoff_location: preset.dropoff_location,
      current_cycle_used_hrs: String(preset.current_cycle_used_hrs)
    });
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.current_location.trim()) {
      setValidationError('Current location is required.');
      return;
    }
    if (!formData.pickup_location.trim()) {
      setValidationError('Pickup location is required.');
      return;
    }
    if (!formData.dropoff_location.trim()) {
      setValidationError('Dropoff location is required.');
      return;
    }
    const cycleHrs = parseFloat(formData.current_cycle_used_hrs);
    if (isNaN(cycleHrs) || cycleHrs < 0 || cycleHrs > 70) {
      setValidationError('Current cycle hours must be a number between 0 and 70.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-6 mb-8">

      {/* Interactive Feature Onboarding Guide */}
      {showOnboarding && (
        <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-5 shadow-xs relative">
          <button
            onClick={() => setShowOnboarding(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
          >
            Dismiss Guide
          </button>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl mt-0.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                How Spotter HOS Compliance Works
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                This app simulates real FMCSA Hours-of-Service regulations (49 CFR § 395). Enter your trip locations and current 70-hour clock below to automatically calculate:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs text-xs">
                  <strong className="text-blue-700 font-semibold">1. Route & Mileage</strong>
                  <span className="text-slate-500 text-[11px]">Geocodes current → pickup → dropoff and calculates exact road driving hours.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs text-xs">
                  <strong className="text-emerald-700 font-semibold">2. Mandatory Rest Stops</strong>
                  <span className="text-slate-500 text-[11px]">Inserts 30m breaks (8h driving), 10h resets (11h/14h limits), and fuel stops (1k mi).</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs text-xs">
                  <strong className="text-indigo-700 font-semibold">3. Daily Log Sheets</strong>
                  <span className="text-slate-500 text-[11px]">Renders official 24-hr DOT graph grids (step functions) ready for download/print.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Dispatch Trip Setup & Duty Clock
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter trip origin, pickup/dropoff locations, and driver's accumulated cycle hours</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-mono font-medium px-2.5 py-1 rounded-lg border border-slate-200">
            4 Required Inputs
          </span>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Test Presets (1-Click Evaluation)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_TRIPS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-600">{preset.title}</span>
                  <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">{preset.tag}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{preset.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Input 1: Current Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                1. Current Location
              </label>
              <input
                type="text"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                placeholder="e.g. Chicago, IL"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Input 2: Pickup Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                2. Pickup Location (1 Hr On-Duty)
              </label>
              <input
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="e.g. St. Louis, MO"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Input 3: Dropoff Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                3. Dropoff Location (1 Hr On-Duty)
              </label>
              <input
                type="text"
                name="dropoff_location"
                value={formData.dropoff_location}
                onChange={handleChange}
                placeholder="e.g. Dallas, TX"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Input 4: Current Cycle Used (Hrs) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                4. Current Cycle Used (Hrs) — 70hr / 8-Day Rolling Clock
              </label>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {parseFloat(formData.current_cycle_used_hrs || 0).toFixed(1)} / 70.0 Hrs Accumulated
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.5"
                min="0"
                max="70"
                name="current_cycle_used_hrs"
                value={formData.current_cycle_used_hrs}
                onChange={handleChange}
                placeholder="e.g. 15.0"
                className="w-32 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="range"
                min="0"
                max="70"
                step="0.5"
                name="current_cycle_used_hrs"
                value={formData.current_cycle_used_hrs || 0}
                onChange={handleChange}
                className="flex-1 accent-blue-600 bg-slate-200 cursor-pointer h-2 rounded-lg"
              />
            </div>
          </div>

          {/* Error Banner */}
          {(validationError || error) && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Simulating HOS Compliance Engine & Route...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Calculate Trip Route & Generate ELD Daily Logs</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
