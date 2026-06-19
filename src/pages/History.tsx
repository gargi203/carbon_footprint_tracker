import React from 'react';
import { useEcoTrack, type HistoricalRecord, type Badge } from '../context/EcoTrackContext';
import { 
  Footprints, 
  Bike, 
  Zap, 
  Leaf, 
  Trash2, 
  Award, 
  Target, 
  Calendar,
  Lock,
  CheckCircle2,
  Table
} from 'lucide-react';

export const History: React.FC = () => {
  const { history, badges } = useEcoTrack();

  const earnedBadges = badges.filter(b => b.isEarned);

  // Icon Resolver
  const getBadgeIcon = (iconName: string, badgeId: string, isEarned: boolean) => {
    const sizeClass = "h-7 w-7";
    
    let colorClass = "text-gray-400 dark:text-gray-600";
    if (isEarned) {
      switch (badgeId) {
        case 'consistent_champion':
          colorClass = "text-yellow-600 dark:text-yellow-400";
          break;
        case 'first_step':
          colorClass = "text-amber-700 dark:text-amber-500";
          break;
        case 'green_commuter':
          colorClass = "text-emerald-600 dark:text-emerald-400";
          break;
        case 'energy_saver':
          colorClass = "text-amber-500 dark:text-yellow-500";
          break;
        case 'plant_powered':
          colorClass = "text-green-600 dark:text-green-400";
          break;
        case 'waste_warrior':
          colorClass = "text-indigo-600 dark:text-indigo-400";
          break;
        case 'goal_crusher':
          colorClass = "text-rose-600 dark:text-rose-400";
          break;
        default:
          colorClass = "text-emerald-500";
      }
    }
    
    switch (iconName) {
      case 'Footprint': return <Footprints className={`${sizeClass} ${colorClass}`} />;
      case 'Bike': return <Bike className={`${sizeClass} ${colorClass}`} />;
      case 'Zap': return <Zap className={`${sizeClass} ${colorClass}`} />;
      case 'Leaf': return <Leaf className={`${sizeClass} ${colorClass}`} />;
      case 'Trash': return <Trash2 className={`${sizeClass} ${colorClass}`} />;
      case 'Target': return <Target className={`${sizeClass} ${colorClass}`} />;
      default: return <Award className={`${sizeClass} ${colorClass}`} />;
    }
  };

  // Get Medallion Gradient & Glossy Coin style
  const getMedallion = (badgeId: string, isEarned: boolean, icon: React.ReactNode) => {
    let medalColor = "from-gray-250 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-400";
    if (isEarned) {
      switch (badgeId) {
        case 'consistent_champion': // Gold
          medalColor = "from-yellow-300 via-amber-400 to-yellow-600 shadow-yellow-500/30";
          break;
        case 'first_step': // Bronze
          medalColor = "from-orange-400 via-amber-500 to-orange-700 shadow-orange-500/20";
          break;
        case 'green_commuter':
          medalColor = "from-emerald-400 via-eco-500 to-teal-600 shadow-emerald-500/20";
          break;
        case 'energy_saver':
          medalColor = "from-yellow-300 via-amber-400 to-orange-500 shadow-amber-500/20";
          break;
        case 'plant_powered':
          medalColor = "from-green-300 via-lime-400 to-emerald-600 shadow-green-500/20";
          break;
        case 'waste_warrior':
          medalColor = "from-indigo-400 via-purple-500 to-violet-600 shadow-indigo-500/20";
          break;
        case 'goal_crusher':
          medalColor = "from-rose-400 via-red-500 to-pink-600 shadow-rose-500/20";
          break;
        default:
          medalColor = "from-emerald-400 to-teal-500";
      }
    }

    return (
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br p-[3px] shadow-lg shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:rotate-12 ${medalColor}`}>
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {isEarned && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 opacity-70" />
          )}
          <div className="relative z-10">
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const getCardStyle = (badgeId: string, isEarned: boolean) => {
    if (!isEarned) {
      return "bg-gray-150/40 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800/80 opacity-55";
    }

    let customClasses = "";
    switch (badgeId) {
      case 'consistent_champion':
        customClasses = "border-yellow-400/40 bg-gradient-to-br from-yellow-400/5 via-amber-400/5 to-transparent shadow-lg shadow-yellow-500/5";
        break;
      case 'first_step':
        customClasses = "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent";
        break;
      case 'green_commuter':
        customClasses = "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent";
        break;
      case 'energy_saver':
        customClasses = "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent";
        break;
      case 'plant_powered':
        customClasses = "border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent";
        break;
      case 'waste_warrior':
        customClasses = "border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-transparent";
        break;
      case 'goal_crusher':
        customClasses = "border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-transparent";
        break;
      default:
        customClasses = "border-emerald-500/20 bg-emerald-50/5";
    }

    return `glass-card ${customClasses}`;
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-10 animate-fade-in">
      
      {/* Page Header */}
      <section>
        <h2 className="text-3xl font-black font-display text-gray-800 dark:text-white m-0">History & Achievements</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review your historical logs, track category reductions, and browse your unlocked eco-medals.</p>
      </section>

      {/* Badges Board */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-eco-500" /> Eco Badges ({earnedBadges.length} / {badges.length})
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map((badge: Badge) => (
            <div 
              key={badge.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all relative group hover:-translate-y-1 ${getCardStyle(badge.id, badge.isEarned)}`}
            >
              {getMedallion(badge.id, badge.isEarned, getBadgeIcon(badge.iconName, badge.id, badge.isEarned))}
              
              <div className="space-y-1 flex-1 pr-4">
                <span className="font-extrabold text-sm text-gray-800 dark:text-white block group-hover:text-eco-600 dark:group-hover:text-eco-400 transition-colors">{badge.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-normal block">{badge.description}</span>
                {badge.isEarned && badge.earnedAt && (
                  <span className="text-[10px] text-eco-600 dark:text-eco-400 font-bold block pt-1 bg-eco-50/50 dark:bg-eco-950/20 px-2 py-0.5 rounded w-fit">
                    Earned: {badge.earnedAt}
                  </span>
                )}
              </div>

              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {badge.isEarned ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Logs List */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-eco-500" /> Carbon Logbook
        </h3>

        {history.length > 0 ? (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-md border-gray-150 dark:border-gray-850">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse" role="table">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-150 dark:border-gray-700/85">
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Logged</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Transport (kg)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Energy (kg)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Food (kg)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Shopping (kg)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Annual CO₂</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                  {history.map((record: HistoricalRecord) => (
                    <tr 
                      key={record.week}
                      className="hover:bg-white/40 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-sm text-gray-800 dark:text-gray-100">{record.week}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-right text-emerald-600 dark:text-emerald-400 font-semibold">{record.breakdown.transport.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-amber-600 dark:text-amber-400 font-semibold">{record.breakdown.energy.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400 font-semibold">{record.breakdown.food.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-indigo-600 dark:text-indigo-400 font-semibold">{record.breakdown.consumption.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gray-800 dark:text-white">
                          {(record.co2Emissions / 1000).toFixed(2)} <span className="text-[10px] text-gray-400 font-semibold">tons</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((record: HistoricalRecord) => (
                <div key={record.week} className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-gray-800 dark:text-white block">{record.week}</span>
                      <span className="text-[10px] text-gray-400 font-medium block">{record.date}</span>
                    </div>
                    <span className="text-sm font-black text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      {(record.co2Emissions / 1000).toFixed(2)} tons / yr
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-lg">
                      <span className="text-gray-500">Transport:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{record.breakdown.transport} kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg">
                      <span className="text-gray-500">Energy:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{record.breakdown.energy} kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-50/30 dark:bg-red-950/10 rounded-lg">
                      <span className="text-gray-500">Food:</span>
                      <span className="font-bold text-red-600 dark:text-red-400">{record.breakdown.food} kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-lg">
                      <span className="text-gray-500">Shopping:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{record.breakdown.consumption} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-6 bg-white/20 dark:bg-gray-900/10">
            <Table className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="font-bold text-gray-700 dark:text-gray-300">No logs recorded</h4>
            <p className="text-xs text-gray-400 mt-1">Submit the onboarding questionnaire to create your initial entries.</p>
          </div>
        )}
      </section>

    </div>
  );
};
