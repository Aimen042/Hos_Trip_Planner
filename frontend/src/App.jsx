import React, { useState } from 'react';
import DriverDetailsScreen from './components/DriverDetailsScreen';
import WelcomeScreen from './components/WelcomeScreen';
import TruckLoader from './components/TruckLoader';
import ResultsScreen from './components/ResultsScreen';
import { planTrip } from './services/api';

export default function App() {
  const [step, setStep] = useState('driver'); // 'driver' | 'welcome' | 'loading' | 'results'
  const [driverDetails, setDriverDetails] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleDriverNext = (driverFormData) => {
    setDriverDetails(driverFormData);
    setStep('welcome');
  };

  const handleTripSubmit = async (formData) => {
    setStep('loading');
    setError(null);

    const startTime = Date.now();

    try {
      const data = await planTrip(formData);
      
      // Ensure smooth animated truck loader displays for at least 2.2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2200 - elapsedTime);

      setTimeout(() => {
        setTripPlan(data);
        setStep('results');
      }, remainingTime);

    } catch (err) {
      setError(err.message || 'Failed to calculate trip plan.');
      setStep('welcome');
    }
  };

  const handleReset = () => {
    setStep('driver');
    setError(null);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans bg-[#031636] relative overflow-hidden">

      {/* Ambient Blob Background (replaces dot-grid texture) */}
      <div className="absolute -top-32 -left-24 w-105 h-105 bg-blue-500/30 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-115 h-115 bg-indigo-500/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-30 left-1/4 w-130 h-130 bg-sky-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-90 h-90 bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Page Content (kept above the blobs via its own stacking context) */}
      <div className="relative flex flex-col min-h-screen">

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Step 1: Driver & Carrier Details Screen */}
          {step === 'driver' && (
            <DriverDetailsScreen onNext={handleDriverNext} initialData={driverDetails} />
          )}

          {/* Step 2: Welcome & Trip Setup Screen */}
          {step === 'welcome' && (
            <WelcomeScreen onSubmit={handleTripSubmit} error={error} />
          )}

          {/* Step 2: Custom Animated Truck Loader Screen */}
          {step === 'loading' && (
            <TruckLoader />
          )}

          {/* Step 3: Log Sheets & Route Results Screen */}
          {step === 'results' && tripPlan && (
            <ResultsScreen tripPlan={tripPlan} onReset={handleReset} />
          )}

        </main>

      </div>
    </div>
  );
}
