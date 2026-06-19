import React from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { generateRecommendations, type Recommendation } from '../services/aiAssistant';
import { getCarbonEquivalencies } from '../utils/carbonCalculator';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Footprints, 
  Award, 
  Target, 
  Sparkles, 
  Zap, 
  Bike, 
  Flame, 
  ShoppingBag, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  TrendingDown,
  TreePine,
  Smartphone,
  Navigation
} from 'lucide-react';

export const Dashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { 
    calculationResult, 
    userProfile, 
    ecoPoints, 
    goals, 
    challenges, 
    history, 
    level, 
    completeChallenge,
    addGoal,
    updateGoalProgress
  } = useEcoTrack();

  if (!userProfile || !calculationResult) {
    return null; // Safety check - App.tsx coordinates routes
  }

  const { breakdown, rating, sustainabilityScore } = calculationResult;
  const equivalencies = getCarbonEquivalencies(breakdown.total);

  // Recharts Category Data
  const pieData = [
    { name: 'Transport', value: breakdown.transport, color: '#10b981' }, // Emerald
    { name: 'Energy', value: breakdown.energy, color: '#f59e0b' },      // Amber
    { name: 'Food', value: breakdown.food, color: '#ef4444' },          // Red
    { name: 'Consumption', value: breakdown.consumption, color: '#6366f1' } // Indigo
  ].filter(item => item.value > 0);

  // Recharts History Data
  const chartHistoryData = history.map(item => ({
    week: item.week,
    emissions: Number((item.co2Emissions / 1000).toFixed(2)), // to tons
    points: item.ecoPoints
  }));

  // Generate AI Recommendations
  const recommendations = generateRecommendations(breakdown, userProfile);

  // Quick Stats
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoalsCount = goals.filter(g => g.isCompleted).length;
  const activeChallenges = challenges.filter(c => !c.isCompleted).slice(0, 2);

  // Convert AI Recommendation into a tracked goal
  const handleAdoptGoal = (rec: Recommendation) => {
    // Check if goal already exists to prevent duplicate addition
    const exists = goals.some(g => g.title === rec.title);
    if (exists) return;

    addGoal({
      category: rec.category,
      title: rec.title,
      targetValue: 100, // percentage target
      unit: '%',
      co2Savings: rec.co2Savings
    });
    
    // Switch to goals tab so user sees it added
    setActiveTab('goals');
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Bike className="h-5 w-5 text-emerald-500" />;
      case 'energy': return <Zap className="h-5 w-5 text-amber-500" />;
      case 'food': return <Flame className="h-5 w-5 text-red-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-indigo-500" />;
    }
  };

  // Difficulty CSS Resolver
  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  // Rating Badge Color
  const getRatingBadgeClass = (rate: string) => {
    switch (rate) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Good': return 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400';
      case 'Average': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome & Level Board */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg border-emerald-500/10">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-800 dark:text-white m-0">Welcome back, Eco Guardian!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your actions are helping shape a greener future. Keep up the momentum!</p>
        </div>
        
        {/* Level Progression */}
        <div className="flex flex-col w-full md:w-80 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-eco-600 dark:text-eco-400 flex items-center gap-1">
              <Award className="h-4 w-4" /> Level {level.current}: {level.name}
            </span>
            <span className="text-gray-500">{ecoPoints} Pts</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={level.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Eco Level Progress">
            <div 
              className="h-full bg-gradient-to-r from-eco-500 to-teal-brand rounded-full transition-all duration-500"
              style={{ width: `${level.progressPercent}%` }}
            />
          </div>
          <span className="text-right text-xs text-gray-400 dark:text-gray-500 font-medium">
            {level.nextLevelPoints - ecoPoints} Pts to next level
          </span>
        </div>
      </section>

      {/* Main Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Performance Indicators">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Footprints className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block uppercase">Carbon Score</span>
            <span className="text-2xl font-black font-display text-gray-800 dark:text-white mt-1 block">
              {(breakdown.total / 1000).toFixed(1)} <span className="text-sm font-normal text-gray-500">tons/yr</span>
            </span>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 block uppercase">Eco Score</span>
            <span className="text-2xl font-black font-display text-gray-800 dark:text-white mt-1 block">
              {sustainabilityScore} <span className="text-sm font-normal text-gray-500">/ 100</span>
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block mt-1">Sustainability index</span>
          </div>
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-gray-150 dark:stroke-gray-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-eco-500 dark:stroke-eco-400"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 - (sustainabilityScore / 100) * (2 * Math.PI * 26)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-xs font-black text-eco-600 dark:text-eco-400">
              {sustainabilityScore}%
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Sparkles className={`h-8 w-8 ${getRatingBadgeClass(rating)}`}>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getRatingBadgeClass(rating)}`}>
                {rating}
              </span>
            </Sparkles>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block uppercase">Sustainability Rating</span>
            <span className={`text-lg font-black font-display mt-1 block`}>
              <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${getRatingBadgeClass(rating)}`}>
                {rating}
              </span>
            </span>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 block uppercase">Goals Completed</span>
            <span className="text-2xl font-black font-display text-gray-800 dark:text-white mt-1 block">
              {completedGoalsCount} <span className="text-sm font-normal text-gray-500">/ {goals.length}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Analytics Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Emissions Analytics Charts">
        
        {/* Left Chart: Emissions Over Time */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white">Emission Reduction Trend</h3>
              <p className="text-xs text-gray-500">Your carbon projection over time in metric tons.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full font-semibold">
              <TrendingDown className="h-3.5 w-3.5" /> Trend Decreasing
            </div>
          </div>
          <div className="w-full h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="emissions" name="CO₂ Emissions (Tons)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Category Breakdown Donut */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col shadow-md">
          <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white mb-1">Source Breakdown</h3>
          <p className="text-xs text-gray-500 mb-6">Emissions split by lifestyle categories (kg CO₂).</p>
          
          <div className="w-full h-60 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} kg CO₂`, 'Emissions']}
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Label */}
            <div className="absolute text-center">
              <span className="text-2xl font-black font-display text-gray-800 dark:text-white">
                {(breakdown.total / 1000).toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wide">Total Tons</span>
            </div>
          </div>

          {/* Custom Legends Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400 block">{item.name}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {Math.round((item.value / breakdown.total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relatable Impact Equivalencies */}
      <section className="glass-panel p-6 rounded-2xl shadow-md border-emerald-500/5">
        <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
          <TreePine className="h-5 w-5 text-emerald-500 animate-pulse" /> Environmental Equivalency
        </h3>
        <p className="text-xs text-gray-500 mb-6">What does your current footprint of {breakdown.total.toLocaleString()} kg CO₂ represent in real-world metrics?</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TreePine className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display block text-gray-800 dark:text-white">
                {equivalencies.treesPlanted}
              </span>
              <span className="text-xs text-gray-500">Mature trees required to absorb this CO₂ in 1 year.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display block text-gray-800 dark:text-white">
                {equivalencies.smartphoneCharges.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Equivalent smartphone charges.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display block text-gray-800 dark:text-white">
                {equivalencies.carMilesDriven.toLocaleString()} km
              </span>
              <span className="text-xs text-gray-500">Driving distance in a standard petrol vehicle.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: AI Advisor */}
        <section className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col shadow-md" aria-label="AI Recommendations">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-eco-100 dark:bg-eco-900/50 text-eco-600 dark:text-eco-400 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white m-0">AI Sustainability Assistant</h3>
              <p className="text-xs text-gray-500">Personalized suggestions sorted by highest emission source.</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {recommendations.slice(0, 3).map(rec => (
              <div key={rec.id} className="p-5 bg-white/40 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start gap-4 transition-all hover:bg-white/70 dark:hover:bg-gray-800/40">
                <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl mt-1">
                  {getCategoryIcon(rec.category)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-gray-800 dark:text-white text-base">{rec.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getDifficultyStyles(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      -{rec.co2Savings} kg/yr
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{rec.description}</p>
                  <p className="text-xs text-eco-600 dark:text-eco-400 font-semibold italic bg-eco-50/50 dark:bg-eco-950/10 p-2 rounded-lg border border-eco-100/50 dark:border-eco-900/10">
                    💡 <span className="font-bold">Advisor Tip:</span> {rec.rationale}
                  </p>
                </div>
                
                {/* Convert Recommendation into a smart goal */}
                <button
                  onClick={() => handleAdoptGoal(rec)}
                  disabled={goals.some(g => g.title === rec.title)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                    goals.some(g => g.title === rec.title)
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-transparent'
                      : 'bg-eco-600 hover:bg-eco-700 text-white shadow-lg shadow-eco-600/10'
                  }`}
                >
                  {goals.some(g => g.title === rec.title) ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Adopted
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Track Goal
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Right Side: Quick Action Widgets */}
        <section className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Weekly Challenges Box */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col flex-1 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white">Active Challenges</h3>
              <button 
                onClick={() => setActiveTab('challenges')} 
                className="text-xs font-bold text-eco-600 dark:text-eco-400 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {activeChallenges.length > 0 ? (
                activeChallenges.map(ch => (
                  <div key={ch.id} className="p-4 bg-white/40 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ch.category)}
                        <span className="font-bold text-sm text-gray-800 dark:text-white">{ch.title}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                        +{ch.pointsReward} Pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-normal">{ch.description}</p>
                    <button
                      onClick={() => completeChallenge(ch.id)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:text-emerald-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete Challenge
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-eco-500 animate-bounce" />
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-300">All Challenges Completed!</span>
                  <span className="text-xs text-gray-400">Awesome job, check back next week for fresh challenges.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Goals Widget */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col flex-1 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white">Active Goals</h3>
              <button 
                onClick={() => setActiveTab('goals')} 
                className="text-xs font-bold text-eco-600 dark:text-eco-400 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                Manage <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {activeGoals.length > 0 ? (
                activeGoals.slice(0, 2).map(goal => {
                  const percent = Math.round((goal.currentValue / goal.targetValue) * 100);
                  return (
                    <div key={goal.id} className="p-4 bg-white/40 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">{goal.title}</span>
                        <span className="text-xs text-gray-400 font-bold">{percent}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-eco-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        <button
                          onClick={() => updateGoalProgress(goal.id, Math.min(goal.targetValue, goal.currentValue + 20))}
                          className="px-2.5 py-1 bg-eco-600 text-white font-bold text-[10px] rounded-md hover:bg-eco-700 cursor-pointer"
                        >
                          + Progress
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex-1">
                  <Target className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <span className="font-bold text-xs text-gray-500">No active goals</span>
                  <button
                    onClick={() => setActiveTab('goals')}
                    className="mt-2 text-xs font-bold text-eco-600 dark:text-eco-400 hover:underline cursor-pointer"
                  >
                    + Setup sustainability goals
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};
