import React, { useState } from 'react';
import { ShieldCheck, Clock, TrendingUp, MapPin, ChevronRight, CheckCircle2, AlertCircle, Truck, Lightbulb, Lock, User, Building2, Hash } from 'lucide-react';

export default function DriverDetailsScreen({ onNext, initialData }) {
  const [formData, setFormData] = useState({
    driver_name: initialData?.driver_name || '',
    carrier_name: initialData?.carrier_name || 'Antigravity Express Logistics Inc.',
    main_office_address: initialData?.main_office_address || '100 Logistics Pkwy, Chicago, IL 60601',
    truck_number: initialData?.truck_number || 'TRK-9042 / TRL-8810',
    home_terminal_address: initialData?.home_terminal_address || '100 Logistics Pkwy, Chicago, IL 60601'
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.driver_name.trim()) {
      setValidationError('Please enter the name of the driver.');
      return;
    }
    if (!formData.carrier_name.trim()) {
      setValidationError('Please enter the name of the carrier.');
      return;
    }
    if (!formData.main_office_address.trim()) {
      setValidationError('Please enter the main office address.');
      return;
    }
    if (!formData.truck_number.trim()) {
      setValidationError('Please enter the truck/trailer numbers.');
      return;
    }
    if (!formData.home_terminal_address.trim()) {
      setValidationError('Please enter the home terminal address.');
      return;
    }

    onNext(formData);
  };

  // Simple profile-completeness metric for the circular widget
  const totalFields = 5;
  const filledFields = Object.values(formData).filter(v => v.trim().length > 0).length;
  const completePct = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="max-w-7xl mx-auto my-4 rounded-3xl overflow-hidden shadow-2xl border grid grid-cols-1 lg:grid-cols-12 bg-white">

      {/* LEFT SIDE PANEL (Truck Photo Background) */}
      <div className="lg:col-span-5 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">

        {/* Background Truck Photo (primary background, no solid color underneath) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/truck-hero.png')" }}
        />

        {/* Light Bottom-to-Top Dark Gradient — only for text legibility over the photo */}
        <div className="absolute inset-0 bg-linear-to-t from-[#031636]/90 via-[#031636]/40 to-[#031636]/60" />

        {/* Top Header Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-blue-500/30 p-2 rounded-xl text-white">
              <Truck className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">
              SPOTTER <span className="bg-blue-500/30 text-blue-300 text-xs font-mono px-2 py-0.5 rounded border border-blue-400/30 ml-1">HOS</span>
            </span>
          </div>

          <span className="text-blue-400 text-xs font-medium block mb-2">👋 Welcome Back!</span>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-white mb-3">
            Plan Smarter.<br />
            <span className="text-blue-400 font-semibold">Drive Safer.</span>
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-8">
            Spotter HOS Trip Planner helps you plan your trip, check HOS compliance, and stay road ready every mile of the way.
          </p>

          {/* 3 Feature Pills */}
          <div className="space-y-4 mt-16">
            <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-medium text-white block">Stay HOS Compliant</strong>
                <span className="text-[11px] text-slate-400">Follow FMCSA rules with confidence</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-medium text-white block">Plan Efficiently</strong>
                <span className="text-[11px] text-slate-400">Optimize your drive and rest time</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-medium text-white block">Drive with Peace of Mind</strong>
                <span className="text-[11px] text-slate-400">Focus on the road, we handle the rest</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE FORM CARD (White Theme) */}
      <div className="lg:col-span-7 p-6 sm:p-10 bg-white text-slate-800 flex flex-col justify-between">

        <div>
          {/* Header & Step 1 of 2 Bar */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[11px] font-semibold text-[#041637] tracking-wider uppercase block">DRIVER PROFILE</span>
              <h2 className="text-xl sm:text-2xl font-medium text-slate-900 flex items-center gap-2">
                Driver & Carrier Details
                <CheckCircle2 className="w-5 h-5 text-[#041637] fill-blue-50" />
              </h2>
              <p className="text-xs text-slate-500 mt-1">Tell us about the driver and carrier before planning the trip.</p>
            </div>

            {/* Step 1 of 2 Card */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs w-44">
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                <span className="font-medium text-slate-800">Step 1 of 2</span>
                <span className="text-[#041637] font-mono">50%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-[#041637] w-1/2 rounded-full"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span className="text-[#041637]">● Driver Details</span>
                <span>Trip Setup</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Entry Details Box */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#041637]" />
                  Entry Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in driver and carrier information for the daily log</p>
              </div>

              {/* Driver & Carrier Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name of Driver</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#041637] absolute left-3 top-3" />
                    <input
                      type="text"
                      name="driver_name"
                      value={formData.driver_name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe (CDL-A)"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name of Carrier</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="carrier_name"
                      value={formData.carrier_name}
                      onChange={handleChange}
                      placeholder="e.g. Antigravity Express Logistics Inc."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address & Truck Numbers Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Main Office Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#041637] absolute left-3 top-3" />
                    <input
                      type="text"
                      name="main_office_address"
                      value={formData.main_office_address}
                      onChange={handleChange}
                      placeholder="e.g. 100 Logistics Pkwy, Chicago, IL 60601"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Truck/Trailer Numbers</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="truck_number"
                      value={formData.truck_number}
                      onChange={handleChange}
                      placeholder="e.g. TRK-9042 / TRL-8810"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Home Terminal Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="home_terminal_address"
                      value={formData.home_terminal_address}
                      onChange={handleChange}
                      placeholder="e.g. 100 Logistics Pkwy, Chicago, IL 60601"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Widgets Row: Profile Completeness & Quick Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Circular Profile Completeness Widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-4">
                {/* SVG Progress Circle */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#041637]"
                      strokeDasharray={`${completePct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-slate-800">
                    {completePct}%
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-slate-900">Profile Completeness</h4>
                  <div className="text-xs font-mono text-slate-700 mt-1">
                    <div><strong>{filledFields}</strong> of {totalFields} fields filled</div>
                    <div className="text-slate-500">Used on your FMCSA daily log</div>
                  </div>
                </div>
              </div>

              {/* Quick Tip Widget */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs">
                <h4 className="font-medium text-blue-900 flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4 text-[#041637]" />
                  Quick Tip
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Accurate driver and carrier details are printed on every FMCSA driver's daily log sheet generated for this trip.
                </p>
              </div>

            </div>

            {/* Error Alert */}
            {validationError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Primary Action Button (#031636 Theme) */}
            <button
              type="submit"
              className="w-full bg-[#031636] hover:bg-[#052252] text-white font-medium py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm"
            >
              <span>Next: Plan Your Trip</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Driver & carrier details are used for your FMCSA 2024 daily log (49 CFR § 395)
            </p>

          </form>
        </div>

      </div>

    </div>
  );
}
