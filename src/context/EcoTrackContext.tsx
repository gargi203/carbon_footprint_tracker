import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateFootprint,
  type OnboardingData, 
  type CalculationResult, 
  type EmissionBreakdown
} from '../utils/carbonCalculator';

export interface HistoricalRecord {
  week: string; // e.g. "Week 1", "Week 2"
  date: string;
  co2Emissions: number; // in kg CO2/year
  breakdown: EmissionBreakdown;
  ecoPoints: number;
}

export interface Goal {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'consumption';
  title: string;
  targetValue: number; // percentage reduction or number of times
  currentValue: number;
  unit: string;
  co2Savings: number; // estimated annual kg CO2 saved
  isCompleted: boolean;
  createdAt: string;
}

export interface Challenge {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'consumption';
  title: string;
  description: string;
  pointsReward: number;
  co2Savings: number; // estimated single-action CO2 savings in kg
  isCompleted: boolean;
  completedAt?: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isEarned: boolean;
  earnedAt?: string;
}

export interface UserAccount {
  name: string;
  email: string;
  passwordHash: string; // Mock password check
}

interface EcoTrackContextType {
  currentUser: { name: string; email: string } | null;
  isAuthenticated: boolean;
  userProfile: OnboardingData | null;
  calculationResult: CalculationResult | null;
  history: HistoricalRecord[];
  goals: Goal[];
  challenges: Challenge[];
  ecoPoints: number;
  badges: Badge[];
  level: {
    current: number;
    name: string;
    nextLevelPoints: number;
    progressPercent: number;
  };
  login: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  submitOnboarding: (data: OnboardingData) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
  completeChallenge: (id: string) => void;
  resetApp: () => void;
}

const EcoTrackContext = createContext<EcoTrackContextType | undefined>(undefined);

const DEFAULT_CHALLENGES: Omit<Challenge, 'isCompleted' | 'priority'>[] = [
  {
    id: 'no_car_day',
    category: 'transport',
    title: 'No-Car Day',
    description: 'Walk, cycle, or take public transit for all commutes today.',
    pointsReward: 50,
    co2Savings: 8.5,
  },
  {
    id: 'public_transit_commute',
    category: 'transport',
    title: 'Transit Tripper',
    description: 'Ride public transport (bus, train, subway) instead of driving today.',
    pointsReward: 40,
    co2Savings: 5.2,
  },
  {
    id: 'meat_free_day',
    category: 'food',
    title: 'Meat-Free Monday',
    description: 'Eat entirely vegetarian or vegan for the whole day.',
    pointsReward: 30,
    co2Savings: 4.8,
  },
  {
    id: 'switch_off_standby',
    category: 'energy',
    title: 'Phantom Power Cut',
    description: 'Unplug chargers and turn off electronics on standby before sleeping.',
    pointsReward: 20,
    co2Savings: 1.5,
  },
  {
    id: 'reusable_bottle',
    category: 'consumption',
    title: 'Reusable Hero',
    description: 'Banish single-use plastics and only drink from reusable bottles/mugs today.',
    pointsReward: 15,
    co2Savings: 0.8,
  },
  {
    id: 'short_shower',
    category: 'energy',
    title: '5-Minute Power Shower',
    description: 'Keep your shower under 5 minutes to conserve hot water and heating energy.',
    pointsReward: 25,
    co2Savings: 2.2,
  },
  {
    id: 'thermostat_eco',
    category: 'energy',
    title: 'Eco-AC Setting',
    description: 'Set your cooling thermostat to 24°C (75°F) or higher for the day.',
    pointsReward: 30,
    co2Savings: 3.5,
  },
  {
    id: 'local_produce',
    category: 'food',
    title: 'Local First',
    description: 'Prepare a meal using only locally grown, seasonal ingredients.',
    pointsReward: 20,
    co2Savings: 1.8,
  }
];

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Completed your first carbon footprint assessment.',
    iconName: 'Footprint',
    isEarned: false
  },
  {
    id: 'green_commuter',
    title: 'Green Commuter',
    description: 'Completed a transport-related goal or challenge.',
    iconName: 'Bike',
    isEarned: false
  },
  {
    id: 'energy_saver',
    title: 'Watt Saver',
    description: 'Completed an energy-saving goal or challenge.',
    iconName: 'Zap',
    isEarned: false
  },
  {
    id: 'plant_powered',
    title: 'Plant Powered',
    description: 'Completed a diet-related goal or challenge.',
    iconName: 'Leaf',
    isEarned: false
  },
  {
    id: 'waste_warrior',
    title: 'Zero Waste Warrior',
    description: 'Completed a consumption or waste challenge.',
    iconName: 'Trash',
    isEarned: false
  },
  {
    id: 'consistent_champion',
    title: 'Consistent Champion',
    description: 'Improved your carbon score for 3 consecutive weeks.',
    iconName: 'Award',
    isEarned: false
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Completed 3 or more smart goals.',
    iconName: 'Target',
    isEarned: false
  }
];

export const EcoTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<OnboardingData | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<HistoricalRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [ecoPoints, setEcoPoints] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Initialize Auth & Seeds on mount
  useEffect(() => {
    // 1. Check for logged in session
    const activeSession = localStorage.getItem('ecotrack_session');
    if (activeSession) {
      const user = JSON.parse(activeSession);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }

    // 2. Seed default accounts if empty
    const savedAccounts = localStorage.getItem('ecotrack_accounts');
    if (!savedAccounts) {
      const demoAccount: UserAccount = {
        name: 'Jane Doe',
        email: 'demo@ecotrack.ai',
        passwordHash: 'password123' // simple plain mock credentials
      };
      localStorage.setItem('ecotrack_accounts', JSON.stringify([demoAccount]));

      // Seed Demo User Carbon Data
      const demoData: OnboardingData = {
        commuteDistance: 25,
        vehicleType: 'petrol',
        publicTransport: 'rarely',
        flightsShort: 3,
        flightsLong: 1,
        electricityUsage: 450,
        renewableEnergy: 10,
        acUsage: 4,
        dietType: 'mixed',
        shoppingFrequency: 'frequent',
        recyclingHabits: 'some',
        plasticUsage: 'high'
      };

      const result = calculateFootprint(demoData);
      const email = 'demo@ecotrack.ai';
      
      localStorage.setItem(`ecotrack_profile_${email}`, JSON.stringify(demoData));
      localStorage.setItem(`ecotrack_result_${email}`, JSON.stringify(result));
      localStorage.setItem(`ecotrack_points_${email}`, '750');

      const mockHistory: HistoricalRecord[] = [];
      const dateToday = new Date();
      const scalingFactors = [1.35, 1.25, 1.18, 1.10, 1.05];
      const weeklyPoints = [0, 80, 180, 310, 520];

      scalingFactors.forEach((factor, idx) => {
        const hDate = new Date();
        hDate.setDate(dateToday.getDate() - (5 - idx) * 7);
        const totalKg = Math.round(result.breakdown.total * factor);
        mockHistory.push({
          week: `Week ${idx + 1}`,
          date: hDate.toISOString().split('T')[0],
          co2Emissions: totalKg,
          breakdown: {
            transport: Math.round(result.breakdown.transport * factor),
            energy: Math.round(result.breakdown.energy * factor),
            food: Math.round(result.breakdown.food * factor),
            consumption: Math.round(result.breakdown.consumption * factor),
            total: totalKg
          },
          ecoPoints: weeklyPoints[idx]
        });
      });

      mockHistory.push({
        week: 'Week 6',
        date: dateToday.toISOString().split('T')[0],
        co2Emissions: result.breakdown.total,
        breakdown: result.breakdown,
        ecoPoints: 750
      });

      localStorage.setItem(`ecotrack_history_${email}`, JSON.stringify(mockHistory));

      const seedChallenges: Challenge[] = DEFAULT_CHALLENGES.map(ch => ({
        ...ch,
        isCompleted: ch.id === 'reusable_bottle' || ch.id === 'switch_off_standby',
        priority: ch.category === 'transport' ? 'High' : 'Medium'
      }));
      localStorage.setItem(`ecotrack_challenges_${email}`, JSON.stringify(seedChallenges));

      const seedGoals: Goal[] = [
        {
          id: 'g1',
          category: 'transport',
          title: 'Ride Public Transit 3x Weekly',
          targetValue: 3,
          currentValue: 1,
          unit: 'times/week',
          co2Savings: 160,
          isCompleted: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      localStorage.setItem(`ecotrack_goals_${email}`, JSON.stringify(seedGoals));

      const seedBadges = INITIAL_BADGES.map(badge => {
        if (badge.id === 'first_step' || badge.id === 'consistent_champion') {
          return {
            ...badge,
            isEarned: true,
            earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }
        return badge;
      });
      localStorage.setItem(`ecotrack_badges_${email}`, JSON.stringify(seedBadges));
    }
  }, []);

  // 3. Load user segregated state when auth user changes
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      setCalculationResult(null);
      setHistory([]);
      setGoals([]);
      setChallenges([]);
      setEcoPoints(0);
      setBadges(INITIAL_BADGES);
      return;
    }

    const email = currentUser.email;
    const savedProfile = localStorage.getItem(`ecotrack_profile_${email}`);
    const savedResult = localStorage.getItem(`ecotrack_result_${email}`);
    const savedHistory = localStorage.getItem(`ecotrack_history_${email}`);
    const savedGoals = localStorage.getItem(`ecotrack_goals_${email}`);
    const savedChallenges = localStorage.getItem(`ecotrack_challenges_${email}`);
    const savedPoints = localStorage.getItem(`ecotrack_points_${email}`);
    const savedBadges = localStorage.getItem(`ecotrack_badges_${email}`);

    setUserProfile(savedProfile ? JSON.parse(savedProfile) : null);
    setCalculationResult(savedResult ? JSON.parse(savedResult) : null);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    setGoals(savedGoals ? JSON.parse(savedGoals) : []);
    setChallenges(savedChallenges ? JSON.parse(savedChallenges) : []);
    setEcoPoints(savedPoints ? parseInt(savedPoints, 10) : 0);
    setBadges(savedBadges ? JSON.parse(savedBadges) : INITIAL_BADGES);
  }, [currentUser]);

  // 4. Save updates to user segregated localStorage
  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    if (userProfile) localStorage.setItem(`ecotrack_profile_${email}`, JSON.stringify(userProfile));
    else localStorage.removeItem(`ecotrack_profile_${email}`);
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    if (calculationResult) localStorage.setItem(`ecotrack_result_${email}`, JSON.stringify(calculationResult));
    else localStorage.removeItem(`ecotrack_result_${email}`);
  }, [calculationResult, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    if (history.length > 0) localStorage.setItem(`ecotrack_history_${email}`, JSON.stringify(history));
    else localStorage.removeItem(`ecotrack_history_${email}`);
  }, [history, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_goals_${email}`, JSON.stringify(goals));
  }, [goals, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_challenges_${email}`, JSON.stringify(challenges));
  }, [challenges, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_points_${email}`, ecoPoints.toString());
  }, [ecoPoints, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_badges_${email}`, JSON.stringify(badges));
  }, [badges, currentUser]);

  // 5. Auth API functions
  const login = (email: string, password: string) => {
    const savedAccounts = localStorage.getItem('ecotrack_accounts');
    const accounts: UserAccount[] = savedAccounts ? JSON.parse(savedAccounts) : [];
    
    const user = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    if (user.passwordHash !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    const sessionUser = { name: user.name, email: user.email };
    localStorage.setItem('ecotrack_session', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const signUp = (name: string, email: string, password: string) => {
    const savedAccounts = localStorage.getItem('ecotrack_accounts');
    const accounts: UserAccount[] = savedAccounts ? JSON.parse(savedAccounts) : [];

    const exists = accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserAccount = {
      name,
      email: email.toLowerCase(),
      passwordHash: password
    };

    const nextAccounts = [...accounts, newUser];
    localStorage.setItem('ecotrack_accounts', JSON.stringify(nextAccounts));

    const sessionUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem('ecotrack_session', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // 6. Level Logic
  const getLevelInfo = (points: number) => {
    let levelNum = 1;
    let levelName = 'Eco Novice';
    let nextLevelPoints = 200;
    let prevLevelPoints = 0;

    if (points > 2000) {
      levelNum = 5;
      levelName = 'Climate Champion';
      nextLevelPoints = 5000;
      prevLevelPoints = 2000;
    } else if (points > 1000) {
      levelNum = 4;
      levelName = 'Carbon Warrior';
      nextLevelPoints = 2000;
      prevLevelPoints = 1000;
    } else if (points > 500) {
      levelNum = 3;
      levelName = 'Planet Friend';
      nextLevelPoints = 1000;
      prevLevelPoints = 500;
    } else if (points > 200) {
      levelNum = 2;
      levelName = 'Green Starter';
      nextLevelPoints = 500;
      prevLevelPoints = 200;
    }

    const levelPointsRange = nextLevelPoints - prevLevelPoints;
    const pointsInLevel = points - prevLevelPoints;
    const progressPercent = Math.min(100, Math.round((pointsInLevel / levelPointsRange) * 100));

    return {
      current: levelNum,
      name: levelName,
      nextLevelPoints,
      progressPercent
    };
  };

  const level = getLevelInfo(ecoPoints);

  const unlockBadge = (id: string, currentBadges: Badge[]): Badge[] => {
    return currentBadges.map(badge => {
      if (badge.id === id && !badge.isEarned) {
        return {
          ...badge,
          isEarned: true,
          earnedAt: new Date().toISOString().split('T')[0]
        };
      }
      return badge;
    });
  };

  // 7. Core data submission rules
  const submitOnboarding = (data: OnboardingData) => {
    const result = calculateFootprint(data);
    setUserProfile(data);
    setCalculationResult(result);

    const totalEmissions = result.breakdown.total || 1;
    const transportRatio = result.breakdown.transport / totalEmissions;
    const foodRatio = result.breakdown.food / totalEmissions;
    const energyRatio = result.breakdown.energy / totalEmissions;

    const initializedChallenges = DEFAULT_CHALLENGES.map(ch => {
      let priority: 'Low' | 'Medium' | 'High' = 'Medium';
      if (ch.category === 'transport' && transportRatio > 0.40) {
        priority = 'High';
      } else if (ch.category === 'food' && foodRatio > 0.30) {
        priority = 'High';
      } else if (ch.category === 'energy' && energyRatio > 0.35) {
        priority = 'High';
      } else if (ch.category === 'consumption' && ch.id === 'reusable_bottle') {
        priority = 'Low';
      }
      return {
        ...ch,
        isCompleted: false,
        priority
      };
    });
    setChallenges(initializedChallenges);

    const mockHistory: HistoricalRecord[] = [];
    const dateToday = new Date();
    const scalingFactors = [1.35, 1.25, 1.18, 1.10, 1.05];
    const weeklyPointsGained = [0, 80, 150, 240, 380];

    scalingFactors.forEach((factor, idx) => {
      const historicalDate = new Date();
      historicalDate.setDate(dateToday.getDate() - (5 - idx) * 7);
      const scaledTotal = Math.round(result.breakdown.total * factor);
      mockHistory.push({
        week: `Week ${idx + 1}`,
        date: historicalDate.toISOString().split('T')[0],
        co2Emissions: scaledTotal,
        breakdown: {
          transport: Math.round(result.breakdown.transport * factor),
          energy: Math.round(result.breakdown.energy * factor),
          food: Math.round(result.breakdown.food * factor),
          consumption: Math.round(result.breakdown.consumption * factor),
          total: scaledTotal
        },
        ecoPoints: weeklyPointsGained[idx]
      });
    });

    mockHistory.push({
      week: 'Week 6',
      date: dateToday.toISOString().split('T')[0],
      co2Emissions: result.breakdown.total,
      breakdown: result.breakdown,
      ecoPoints: 500
    });

    setHistory(mockHistory);
    let points = 500;
    let currentBadges = [...INITIAL_BADGES];
    currentBadges = unlockBadge('first_step', currentBadges);
    points += 100; // Bonus Streak points
    currentBadges = unlockBadge('consistent_champion', currentBadges);

    setEcoPoints(points);
    setBadges(currentBadges);
  };

  const addGoal = (newGoal: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substring(2, 9),
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGoals(prev => [goal, ...prev]);
  };

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const isNowCompleted = progress >= goal.targetValue;
        const wasCompleted = goal.isCompleted;

        if (isNowCompleted && !wasCompleted) {
          const pointsReward = 100;
          setEcoPoints(pts => pts + pointsReward);

          setTimeout(() => {
            setBadges(currBadges => {
              let updated = [...currBadges];
              if (goal.category === 'transport') updated = unlockBadge('green_commuter', updated);
              if (goal.category === 'energy') updated = unlockBadge('energy_saver', updated);
              if (goal.category === 'food') updated = unlockBadge('plant_powered', updated);
              if (goal.category === 'consumption') updated = unlockBadge('waste_warrior', updated);

              const completedCount = goals.filter(g => g.isCompleted || g.id === id).length;
              if (completedCount >= 3) {
                updated = unlockBadge('goal_crusher', updated);
              }
              return updated;
            });
          }, 0);
        }

        return {
          ...goal,
          currentValue: progress,
          isCompleted: isNowCompleted
        };
      }
      return goal;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completeChallenge = (id: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === id && !ch.isCompleted) {
        setEcoPoints(pts => pts + ch.pointsReward);

        setTimeout(() => {
          setBadges(currBadges => {
            let updated = [...currBadges];
            if (ch.category === 'transport') updated = unlockBadge('green_commuter', updated);
            if (ch.category === 'energy') updated = unlockBadge('energy_saver', updated);
            if (ch.category === 'food') updated = unlockBadge('plant_powered', updated);
            if (ch.category === 'consumption') updated = unlockBadge('waste_warrior', updated);
            return updated;
          });
        }, 0);

        return {
          ...ch,
          isCompleted: true,
          completedAt: new Date().toISOString().split('T')[0]
        };
      }
      return ch;
    }));
  };

  const resetApp = () => {
    if (!currentUser) return;
    const email = currentUser.email;

    setUserProfile(null);
    setCalculationResult(null);
    setHistory([]);
    setGoals([]);
    setChallenges([]);
    setEcoPoints(0);
    setBadges(INITIAL_BADGES);

    localStorage.removeItem(`ecotrack_profile_${email}`);
    localStorage.removeItem(`ecotrack_result_${email}`);
    localStorage.removeItem(`ecotrack_history_${email}`);
    localStorage.removeItem(`ecotrack_goals_${email}`);
    localStorage.removeItem(`ecotrack_challenges_${email}`);
    localStorage.removeItem(`ecotrack_points_${email}`);
    localStorage.removeItem(`ecotrack_badges_${email}`);
  };

  return (
    <EcoTrackContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        userProfile,
        calculationResult,
        history,
        goals,
        challenges,
        ecoPoints,
        badges,
        level,
        login,
        signUp,
        logout,
        submitOnboarding,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        completeChallenge,
        resetApp
      }}
    >
      {children}
    </EcoTrackContext.Provider>
  );
};

export const useEcoTrack = () => {
  const context = useContext(EcoTrackContext);
  if (context === undefined) {
    throw new Error('useEcoTrack must be used within an EcoTrackProvider');
  }
  return context;
};
