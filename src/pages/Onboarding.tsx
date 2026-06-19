import React, { useState, useEffect } from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { type OnboardingData } from '../utils/carbonCalculator';
import onboardingHero from '../assets/onboarding_hero.png';
import { 
  Car, 
  Zap, 
  Flame, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Plane, 
  Loader2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

const ECO_FACTS: Record<number, string[]> = {
  1: [
    "A single passenger car generates about 4.6 metric tons of carbon dioxide annually.",
    "Flying creates up to 100x more CO₂ emissions per hour than a train ride.",
    "Active transport (biking or walking) yields zero greenhouse gases and reduces street congestion.",
    "Riding standard electric rails reduces your commute emissions by 85% compared to solo driving."
  ],
  2: [
    "Space heating and cooling represent over 50% of the average home's total electricity footprint.",
    "LED bulbs consume up to 80% less energy and operate 25 times longer than typical bulbs.",
    "Phantom loads (electronics left plugged in on standby) consume up to 10% of standard home power.",
    "A 100% green utility tariff channels your monthly spending directly into solar and wind grid expansion."
  ],
  3: [
    "Global agricultural supply chains contribute 26% of all greenhouse gas emissions.",
    "Red meat production generates nearly 10x the emissions of poultry and 30x the emissions of plant proteins.",
    "Choosing plant-based options just one day a week cuts your food-related emissions by 15%.",
    "Adopting a plant-centered menu drops your personal culinary carbon impact by up to 70%."
  ],
  4: [
    "Logistics and shipping boxes from frequent online deliveries create immense industrial waste.",
    "Recycling metals saves up to 95% of the greenhouse emissions needed to refine raw metal ores.",
    "Standard disposable plastics are petroleum derivatives that accumulate in landfills for centuries.",
    "Choosing reusables (canvas bags, steel canisters) helps lower oil demand and microplastic pollution."
  ]
};

export const Onboarding: React.FC = () => {
  const { submitOnboarding } = useEcoTrack();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing lifestyle factors...');
  const [activeFactIdx, setActiveFactIdx] = useState(0);
  
  const [formData, setFormData] = useState<OnboardingData>({
    commuteDistance: 15,
    vehicleType: 'petrol',
    publicTransport: 'rarely',
    flightsShort: 2,
    flightsLong: 0,
    electricityUsage: 300,
    renewableEnergy: 0,
    acUsage: 2,
    dietType: 'mixed',
    shoppingFrequency: 'average',
    recyclingHabits: 'some',
    plasticUsage: 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cycle facts when step changes or periodically
  useEffect(() => {
    setActiveFactIdx(Math.floor(Math.random() * ECO_FACTS[step].length));
  }, [step]);

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const nextErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (formData.commuteDistance < 0) {
        nextErrors.commuteDistance = 'Commute distance must be positive.';
      }
      if (formData.flightsShort < 0) {
        nextErrors.flightsShort = 'Flights count cannot be negative.';
      }
      if (formData.flightsLong < 0) {
        nextErrors.flightsLong = 'Flights count cannot be negative.';
      }
    } else if (step === 2) {
      if (formData.electricityUsage < 0) {
        nextErrors.electricityUsage = 'Electricity usage cannot be negative.';
      }
      if (formData.renewableEnergy < 0 || formData.renewableEnergy > 100) {
        nextErrors.renewableEnergy = 'Percentage must be between 0 and 100.';
      }
      if (formData.acUsage < 0 || formData.acUsage > 24) {
        nextErrors.acUsage = 'AC hours must be between 0 and 24.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    
    const textIntervals = [
      { text: 'Running EPA scoring models...', delay: 550 },
      { text: 'Generating custom recommendations...', delay: 1100 },
      { text: 'Setting weekly green targets...', delay: 1650 }
    ];

    textIntervals.forEach(item => {
      setTimeout(() => {
        setLoadingText(item.text);
      }, item.delay);
    });

    setTimeout(() => {
      submitOnboarding(formData);
      setLoading(false);
    }, 2200);
  };

  const totalSteps = 4;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-panel p-8 md:p-12 rounded-2xl max-w-md w-full text-center flex flex-col items-center space-y-6 animate-scale-in">
          <Loader2 className="h-16 w-16 text-eco-500 animate-spin" />
          <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">EcoTrack AI Reasoning</h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">{loadingText}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-eco-500 rounded-full animate-infinite transition-all duration-[2200ms]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 animate-fade-in flex flex-col items-center justify-center">
      
      {/* Header section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold font-display bg-gradient-to-r from-eco-600 to-teal-brand bg-clip-text text-transparent dark:from-eco-400 dark:to-teal-brand m-0 tracking-tight">
          Calculate Your Carbon Impact
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm md:text-base">
          Answer a few quick questions to assess your carbon footprint. EcoTrack AI will generate custom savings goals and habit recommendations.
        </p>
      </div>

      {/* Progress tracker header */}
      <div className="w-full max-w-xl mb-8" aria-label="Progress Tracker">
        <div className="flex justify-between items-center mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-initial">
              <button
                onClick={() => i + 1 < step && setStep(i + 1)}
                disabled={i + 1 >= step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  step === i + 1
                    ? 'bg-eco-500 border-eco-500 text-white shadow-lg shadow-eco-500/20'
                    : step > i + 1
                    ? 'bg-eco-100 dark:bg-eco-900 border-eco-500 text-eco-600 dark:text-eco-400 cursor-pointer'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                aria-current={step === i + 1 ? 'step' : undefined}
                aria-label={`Step ${i + 1}`}
              >
                {i + 1}
              </button>
              {i < totalSteps - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                    step > i + 1 ? 'bg-eco-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-bold px-1">
          <span>Transport</span>
          <span>Energy</span>
          <span>Diet</span>
          <span>Consumption</span>
        </div>
      </div>

      {/* Main Grid: split-screen view on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Column: Onboarding illustration & Eco Facts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Onboarding Hero Image */}
          <div className="glass-panel p-4 rounded-2xl shadow-md overflow-hidden animate-scale-in">
            <img 
              src={onboardingHero} 
              alt="Sustainable ecological city illustration showing wind turbines, solar panels, and commuters" 
              className="w-full h-auto rounded-xl object-cover"
              loading="eager"
            />
          </div>

          {/* Dynamic Eco Fact Widget */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-eco-500 shadow-md animate-slide-up">
            <div className="flex items-center gap-2 mb-2 text-eco-600 dark:text-eco-400 font-bold text-sm">
              <Lightbulb className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>Eco-Intelligence Fact</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-350 leading-relaxed font-medium">
              {ECO_FACTS[step][activeFactIdx]}
            </p>
          </div>
        </div>

        {/* Right Column: Question Form Card */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="w-full glass-panel p-6 md:p-8 rounded-2xl shadow-xl space-y-8">
            
            {/* STEP 1: TRANSPORTATION */}
            {step === 1 && (
              <fieldset className="space-y-6">
                <legend className="flex items-center gap-2 text-2xl font-bold font-display text-gray-800 dark:text-gray-100 mb-6">
                  <Car className="h-6 w-6 text-eco-500" />
                  Transportation Habits
                </legend>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="commuteDistance" className="font-semibold text-gray-700 dark:text-gray-200">
                      Daily Commute Distance
                    </label>
                    <span className="text-eco-600 dark:text-eco-400 font-bold">{formData.commuteDistance} km / day</span>
                  </div>
                  <input
                    type="range"
                    id="commuteDistance"
                    min="0"
                    max="150"
                    value={formData.commuteDistance}
                    onChange={e => updateField('commuteDistance', parseInt(e.target.value, 10))}
                    className="w-full accent-eco-500 cursor-pointer"
                  />
                  <p className="text-xs text-gray-450 dark:text-gray-500">Includes commuting to work, school, grocery runs, or daily errands.</p>
                  {errors.commuteDistance && (
                    <span className="flex items-center gap-1 text-sm text-red-500 font-medium mt-1">
                      <AlertCircle className="h-4 w-4" /> {errors.commuteDistance}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Primary Commute Vehicle Type</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'petrol', label: 'Petrol Car', desc: 'Gasoline engine' },
                      { value: 'diesel', label: 'Diesel Car', desc: 'Diesel engine' },
                      { value: 'hybrid', label: 'Hybrid Car', desc: 'Gas + Electric' },
                      { value: 'electric', label: 'Electric Car', desc: 'Battery powered' },
                      { value: 'motorcycle', label: 'Motorcycle', desc: 'Two-wheeler' },
                      { value: 'none', label: 'No Car / Walk', desc: 'Walking, Cycling, etc.' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          formData.vehicleType === item.value
                            ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="vehicleType"
                          value={item.value}
                          checked={formData.vehicleType === item.value}
                          onChange={() => updateField('vehicleType', item.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-sm text-gray-850 dark:text-gray-100">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Public Transport Frequency</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'daily', label: 'Daily', desc: 'Bus, trains every day' },
                      { value: 'often', label: 'Often', desc: 'Multi-weekly commutes' },
                      { value: 'rarely', label: 'Rarely', desc: 'Occasionally' },
                      { value: 'never', label: 'Never', desc: 'Strictly personal car' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex flex-col p-3 rounded-xl border-2 cursor-pointer text-center transition-all hover:scale-[1.01] ${
                          formData.publicTransport === item.value
                            ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="publicTransport"
                          value={item.value}
                          checked={formData.publicTransport === item.value}
                          onChange={() => updateField('publicTransport', item.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-sm text-gray-850 dark:text-gray-100">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label htmlFor="flightsShort" className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200">
                      <Plane className="h-4 w-4 text-gray-500" /> Short Flights per Year
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('flightsShort', Math.max(0, formData.flightsShort - 1))}
                        className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="flightsShort"
                        value={formData.flightsShort}
                        onChange={e => updateField('flightsShort', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="flex-1 text-center glass-input h-10 py-0"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('flightsShort', formData.flightsShort + 1)}
                        className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">Short flights are less than 3 hours.</span>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="flightsLong" className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200">
                      <Plane className="h-4 w-4 text-gray-500 rotate-45" /> Long Flights per Year
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('flightsLong', Math.max(0, formData.flightsLong - 1))}
                        className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="flightsLong"
                        value={formData.flightsLong}
                        onChange={e => updateField('flightsLong', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="flex-1 text-center glass-input h-10 py-0"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('flightsLong', formData.flightsLong + 1)}
                        className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">Long-haul flights are greater than 3 hours.</span>
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 2: ENERGY CONSUMPTION */}
            {step === 2 && (
              <fieldset className="space-y-6 animate-scale-in">
                <legend className="flex items-center gap-2 text-2xl font-bold font-display text-gray-800 dark:text-gray-100 mb-6">
                  <Zap className="h-6 w-6 text-eco-500" />
                  Home Energy Usage
                </legend>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="electricityUsage" className="font-semibold text-gray-700 dark:text-gray-200">
                      Monthly Electricity Usage
                    </label>
                    <span className="text-eco-600 dark:text-eco-400 font-bold">{formData.electricityUsage} kWh</span>
                  </div>
                  <input
                    type="range"
                    id="electricityUsage"
                    min="50"
                    max="1500"
                    step="25"
                    value={formData.electricityUsage}
                    onChange={e => updateField('electricityUsage', parseInt(e.target.value, 10))}
                    className="w-full accent-eco-500 cursor-pointer"
                  />
                  <p className="text-xs text-gray-450 dark:text-gray-500">Check your utility bill. Average household uses around 300-400 kWh.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="renewableEnergy" className="font-semibold text-gray-700 dark:text-gray-200">
                      Renewable Energy Share
                    </label>
                    <span className="text-eco-600 dark:text-eco-400 font-bold">{formData.renewableEnergy}%</span>
                  </div>
                  <input
                    type="range"
                    id="renewableEnergy"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.renewableEnergy}
                    onChange={e => updateField('renewableEnergy', parseInt(e.target.value, 10))}
                    className="w-full accent-eco-500 cursor-pointer"
                  />
                  <p className="text-xs text-gray-450 dark:text-gray-500">Percentage of electricity sourced from clean energy tariffs, solar panels, or wind power.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="acUsage" className="font-semibold text-gray-700 dark:text-gray-200">
                      Daily Air Conditioning Runtime
                    </label>
                    <span className="text-eco-600 dark:text-eco-400 font-bold">{formData.acUsage} hours / day</span>
                  </div>
                  <input
                    type="range"
                    id="acUsage"
                    min="0"
                    max="24"
                    value={formData.acUsage}
                    onChange={e => updateField('acUsage', parseInt(e.target.value, 10))}
                    className="w-full accent-eco-500 cursor-pointer"
                  />
                  <p className="text-xs text-gray-450 dark:text-gray-500">Average running time of A/C units during hotter seasons.</p>
                </div>
              </fieldset>
            )}

            {/* STEP 3: FOOD HABITS */}
            {step === 3 && (
              <fieldset className="space-y-6 animate-scale-in">
                <legend className="flex items-center gap-2 text-2xl font-bold font-display text-gray-800 dark:text-gray-100 mb-6">
                  <Flame className="h-6 w-6 text-eco-500" />
                  Dietary Habits
                </legend>

                <div className="space-y-4">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Select the option that best matches your diet</span>
                  <div className="flex flex-col gap-3">
                    {[
                      { value: 'meat-heavy', title: 'Meat-Heavy Diet', desc: 'Frequent red meat, poultry, and fish consumer daily.' },
                      { value: 'mixed', title: 'Average Mixed Diet', desc: 'Balanced intake of meat, vegetables, dairy, and grains.' },
                      { value: 'vegetarian', title: 'Vegetarian Diet', desc: 'No meat or fish; consumes dairy, eggs, and plant produce.' },
                      { value: 'vegan', title: 'Vegan Diet', desc: 'Strictly plant-based nutrition; zero animal-derived items.' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          formData.dietType === item.value
                            ? 'border-eco-500 bg-eco-50/55 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dietType"
                          value={item.value}
                          checked={formData.dietType === item.value}
                          onChange={() => updateField('dietType', item.value)}
                          className="mt-1 mr-3 accent-eco-500"
                        />
                        <div>
                          <span className="block font-bold text-gray-800 dark:text-gray-100">{item.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 4: SHOPPING & WASTE */}
            {step === 4 && (
              <fieldset className="space-y-6 animate-scale-in">
                <legend className="flex items-center gap-2 text-2xl font-bold font-display text-gray-800 dark:text-gray-100 mb-6">
                  <ShoppingBag className="h-6 w-6 text-eco-500" />
                  Shopping & Waste Habits
                </legend>

                <div className="space-y-3">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Online Shopping Frequency</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'frequent', label: 'Frequent', desc: 'Multiple packages weekly' },
                      { value: 'average', label: 'Average', desc: 'Few times a month' },
                      { value: 'rare', label: 'Rare', desc: 'Only essential items' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          formData.shoppingFrequency === item.value
                            ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shoppingFrequency"
                          value={item.value}
                          checked={formData.shoppingFrequency === item.value}
                          onChange={() => updateField('shoppingFrequency', item.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-sm text-gray-850 dark:text-gray-100">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Home Recycling Practices</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'all', label: 'Complete Recycling', desc: 'Sort paper, metals, glass, plastic' },
                      { value: 'some', label: 'Partial Recycling', desc: 'Recycle only simple cardboards/paper' },
                      { value: 'none', label: 'No Recycling', desc: 'Send all household waste to trash' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          formData.recyclingHabits === item.value
                            ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="recyclingHabits"
                          value={item.value}
                          checked={formData.recyclingHabits === item.value}
                          onChange={() => updateField('recyclingHabits', item.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-sm text-gray-850 dark:text-gray-100">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Disposable Plastic Usage</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'high', label: 'High Usage', desc: 'Use plastic bags/bottles daily' },
                      { value: 'medium', label: 'Medium Usage', desc: 'Occasional plastics' },
                      { value: 'low', label: 'Low Usage', desc: 'Prefer canvas/reusable glass' }
                    ].map(item => (
                      <label
                        key={item.value}
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                          formData.plasticUsage === item.value
                            ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-eco-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="plasticUsage"
                          value={item.value}
                          checked={formData.plasticUsage === item.value}
                          onChange={() => updateField('plasticUsage', item.value)}
                          className="sr-only"
                        />
                        <span className="font-bold text-sm text-gray-850 dark:text-gray-100">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-eco-600 hover:bg-eco-700 text-white rounded-xl font-semibold transition-colors cursor-pointer shadow-lg shadow-eco-600/10"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-eco-600 hover:bg-eco-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-lg shadow-eco-600/20 animate-pulse"
                >
                  Calculate My Footprint <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
};
