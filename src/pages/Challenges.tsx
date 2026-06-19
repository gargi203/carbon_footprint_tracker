import React from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { 
  CheckCircle2, 
  Sparkles, 
  Bike, 
  Zap, 
  Flame, 
  ShoppingBag, 
  Star,
  Award
} from 'lucide-react';

export const Challenges: React.FC = () => {
  const { challenges, completeChallenge } = useEcoTrack();

  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  // Sorting challenges: High priority first, then Medium, then Low
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  const sortedActiveChallenges = [...activeChallenges].sort((a, b) => {
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport': return <Bike className="h-6 w-6 text-emerald-500" />;
      case 'energy': return <Zap className="h-6 w-6 text-amber-500" />;
      case 'food': return <Flame className="h-6 w-6 text-red-500" />;
      default: return <ShoppingBag className="h-6 w-6 text-indigo-500" />;
    }
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-800 dark:text-white m-0">Weekly Eco Challenges</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complete dynamic weekly challenges to earn Eco Points. High-priority challenges are highlighted by your AI Assistant based on your highest emission sectors.
          </p>
        </div>
        
        {/* Progress Tracker Card */}
        <div className="bg-white/30 dark:bg-gray-800/30 border border-gray-150 dark:border-gray-850 px-5 py-3 rounded-xl flex items-center gap-3 shrink-0">
          <Award className="h-8 w-8 text-eco-500" />
          <div>
            <span className="text-xs text-gray-400 block font-semibold uppercase">Weekly Progress</span>
            <span className="font-bold text-gray-800 dark:text-white">
              {completedChallenges.length} / {challenges.length} Completed
            </span>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-eco-500" /> Active Tasks
        </h3>

        {sortedActiveChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedActiveChallenges.map(ch => (
              <div 
                key={ch.id} 
                className={`glass-card p-6 flex flex-col justify-between space-y-6 border-t-4 relative overflow-hidden ${
                  ch.priority === 'High' 
                    ? 'border-t-rose-500 dark:border-t-rose-400 shadow-md ring-2 ring-rose-500/10' 
                    : 'border-t-eco-500 dark:border-t-eco-400'
                }`}
              >
                {/* Priority Ribbon */}
                {ch.priority === 'High' && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> AI Priority Target
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      {getCategoryIcon(ch.category)}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 pt-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeStyles(ch.priority)}`}>
                        {ch.priority} Priority
                      </span>
                      <span className="text-xs text-eco-600 dark:text-eco-400 font-bold">
                        -{ch.co2Savings} kg CO₂
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-lg text-gray-800 dark:text-white leading-snug">{ch.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ch.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800/40">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-lg">
                    +{ch.pointsReward} Pts
                  </span>
                  
                  <button
                    onClick={() => completeChallenge(ch.id)}
                    className="px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white font-bold text-xs rounded-xl shadow-md shadow-eco-600/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Check Off
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-6 bg-white/20 dark:bg-gray-900/10 max-w-xl mx-auto">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h4 className="font-bold text-lg text-gray-800 dark:text-white">Clean Sweep!</h4>
            <p className="text-sm text-gray-500 mt-2">
              You have completed all active challenges for this week. Outstanding commitment to the planet! Check back next week for fresh targets.
            </p>
          </div>
        )}
      </section>

      {/* Completed Challenges Section */}
      {completedChallenges.length > 0 && (
        <section className="space-y-4 pt-6">
          <h3 className="text-lg font-bold font-display text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Completed This Week ({completedChallenges.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedChallenges.map(ch => (
              <div 
                key={ch.id} 
                className="p-4 bg-white/40 dark:bg-gray-800/10 border border-emerald-500/20 rounded-xl flex flex-col justify-between gap-3 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                      {getCategoryIcon(ch.category)}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Done
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white">{ch.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{ch.description}</p>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-150/40 dark:border-gray-800/20 text-xs">
                  <span className="text-gray-400">Awarded +{ch.pointsReward} Pts</span>
                  <span className="text-emerald-600 font-bold">-{ch.co2Savings} kg CO₂</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
