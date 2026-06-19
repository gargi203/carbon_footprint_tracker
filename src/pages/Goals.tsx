import React, { useState } from 'react';
import { useEcoTrack, type Goal } from '../context/EcoTrackContext';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Bike, 
  Zap, 
  Flame, 
  ShoppingBag,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const SUGGESTED_GOALS: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>[] = [
  {
    category: 'transport',
    title: 'Ride Public Transit 3x Weekly',
    targetValue: 3,
    unit: 'times/week',
    co2Savings: 160
  },
  {
    category: 'transport',
    title: 'Carpool to Work 2 Days/Week',
    targetValue: 2,
    unit: 'days/week',
    co2Savings: 180
  },
  {
    category: 'energy',
    title: 'Cut AC Usage by 2 Hours Daily',
    targetValue: 2,
    unit: 'hours/day',
    co2Savings: 110
  },
  {
    category: 'energy',
    title: 'Switch to 100% Green Energy Plan',
    targetValue: 100,
    unit: '%',
    co2Savings: 450
  },
  {
    category: 'food',
    title: 'Eat Fully Plant-Based 3 Days/Week',
    targetValue: 3,
    unit: 'days/week',
    co2Savings: 280
  },
  {
    category: 'consumption',
    title: 'Banish Single-Use Plastic Bottles',
    targetValue: 100,
    unit: '%',
    co2Savings: 80
  },
  {
    category: 'consumption',
    title: 'Recycle 100% of Household Cardboard',
    targetValue: 100,
    unit: '%',
    co2Savings: 120
  }
];

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useEcoTrack();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'transport' | 'energy' | 'food' | 'consumption'>('transport');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('times/week');
  const [co2Savings, setCo2Savings] = useState(50);

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal description.');
      return;
    }
    if (targetValue <= 0) {
      setError('Target value must be greater than zero.');
      return;
    }
    if (co2Savings < 0) {
      setError('Savings cannot be negative.');
      return;
    }

    addGoal({
      category,
      title,
      targetValue,
      unit,
      co2Savings
    });

    // Reset Form
    setTitle('');
    setCategory('transport');
    setTargetValue(1);
    setUnit('times/week');
    setCo2Savings(50);
    setError('');
    setShowAddForm(false);
  };

  const handleQuickAdd = (suggested: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>) => {
    // Avoid duplicates
    if (goals.some(g => g.title === suggested.title)) return;
    addGoal(suggested);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport': return <Bike className="h-5 w-5 text-emerald-500" />;
      case 'energy': return <Zap className="h-5 w-5 text-amber-500" />;
      case 'food': return <Flame className="h-5 w-5 text-red-500" />;
      default: return <ShoppingBag className="h-5 w-5 text-indigo-500" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transport': return 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5';
      case 'energy': return 'border-amber-500/20 bg-amber-50/10 dark:bg-amber-950/5';
      case 'food': return 'border-red-500/20 bg-red-50/10 dark:bg-red-950/5';
      default: return 'border-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-950/5';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-800 dark:text-white m-0">Smart Goals Tracker</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set realistic sustainability milestones, track progress, and earn +100 Eco Points per completed goal.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-eco-600 hover:bg-eco-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-eco-600/10 cursor-pointer shrink-0"
        >
          <Plus className="h-5 w-5" /> {showAddForm ? 'Close Drawer' : 'Create Custom Goal'}
        </button>
      </section>

      {/* Goal Creation Drawer */}
      {showAddForm && (
        <section className="glass-panel p-6 rounded-2xl animate-scale-in max-w-2xl mx-auto shadow-lg">
          <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white mb-4">New Sustainability Goal</h3>
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label htmlFor="goalTitle" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Goal Description</label>
              <input
                type="text"
                id="goalTitle"
                placeholder="e.g. Ride bicycle to grocery store"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full glass-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="goalCategory" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Category</label>
                <select
                  id="goalCategory"
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full glass-input"
                >
                  <option value="transport">Transportation</option>
                  <option value="energy">Home Energy</option>
                  <option value="food">Dietary & Food</option>
                  <option value="consumption">Shopping & Waste</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="goalUnit" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tracking Unit</label>
                <input
                  type="text"
                  id="goalUnit"
                  placeholder="e.g. times/week, %, days/month"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="goalTarget" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Target Value</label>
                <input
                  type="number"
                  id="goalTarget"
                  min="1"
                  value={targetValue}
                  onChange={e => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="goalSavings" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Est. Annual CO₂ Saved (kg)</label>
                <input
                  type="number"
                  id="goalSavings"
                  min="0"
                  value={co2Savings}
                  onChange={e => setCo2Savings(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full glass-input"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1 text-sm text-red-500 font-medium">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-eco-600/10 cursor-pointer"
              >
                Launch Goal
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Goal Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Goal Cards List */}
        <section className="lg:col-span-8 space-y-6" aria-label="Goals Trackers">
          
          {/* Active Goals Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-eco-500 animate-pulse" /> Active Milestones ({activeGoals.length})
            </h3>
            
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeGoals.map(goal => {
                  const percent = Math.round((goal.currentValue / goal.targetValue) * 100);
                  return (
                    <div 
                      key={goal.id} 
                      className={`glass-card p-5 border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 ${getCategoryColor(goal.category)}`}
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(goal.category)}
                          <div>
                            <span className="font-extrabold text-base text-gray-800 dark:text-white block">{goal.title}</span>
                            <span className="text-xs text-gray-400 capitalize">Goal Category: {goal.category}</span>
                          </div>
                        </div>

                        {/* Progress slider bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-500">Progress: {percent}%</span>
                            <span className="text-eco-600 dark:text-eco-400">-{goal.co2Savings} kg CO₂ / yr expected</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-eco-500 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls */}
                      <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800/40">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-700 dark:text-gray-200">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                          
                          {/* Slider control to change progress manually */}
                          <input
                            type="range"
                            min="0"
                            max={goal.targetValue}
                            value={goal.currentValue}
                            onChange={e => updateGoalProgress(goal.id, parseInt(e.target.value, 10))}
                            className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-eco-500"
                            aria-label={`Progress for ${goal.title}`}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateGoalProgress(goal.id, goal.targetValue)}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                            aria-label="Mark Goal Completed"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
                            aria-label="Delete Goal"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-6 bg-white/20 dark:bg-gray-900/10">
                <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700 dark:text-gray-300">No active goals yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">Setup custom milestones or adopt recommendations from the panel on the right.</p>
              </div>
            )}
          </div>

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Completed Achievements ({completedGoals.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {completedGoals.map(goal => (
                  <div 
                    key={goal.id} 
                    className="p-4 bg-white/40 dark:bg-gray-800/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-800 dark:text-white line-through block">{goal.title}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Saved ~{goal.co2Savings} kg CO₂ / yr</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Completed
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        aria-label="Delete Completed Goal Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Suggestions Drawer */}
        <section className="lg:col-span-4 glass-panel p-6 rounded-2xl shadow-md h-fit" aria-label="Suggested Green Goals">
          <h3 className="text-lg font-bold font-display text-gray-800 dark:text-white">Curated Recommendations</h3>
          <p className="text-xs text-gray-500 mb-6">Adopt pre-made eco-milestones to kickstart your tracking.</p>

          <div className="space-y-3.5">
            {SUGGESTED_GOALS.map((suggested, idx) => {
              const alreadyAdopted = goals.some(g => g.title === suggested.title);
              return (
                <div 
                  key={idx} 
                  className="p-4 bg-white/50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 hover:bg-white/70 dark:hover:bg-gray-800/35 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(suggested.category)}
                      <span className="font-bold text-xs text-gray-800 dark:text-white">{suggested.title}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-semibold">Target: {suggested.targetValue} {suggested.unit}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">-{suggested.co2Savings} kg/yr</span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(suggested)}
                    disabled={alreadyAdopted}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      alreadyAdopted
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-eco-600 hover:bg-eco-700 text-white shadow-md shadow-eco-600/10'
                    }`}
                  >
                    {alreadyAdopted ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Tracking
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> Adopt Goal
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
