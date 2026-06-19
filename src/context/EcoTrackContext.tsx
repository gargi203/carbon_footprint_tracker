import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateFootprint,
  type OnboardingData, 
  type CalculationResult, 
  type EmissionBreakdown
} from '../utils/carbonCalculator';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => void;
  submitOnboarding: (data: OnboardingData) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
  completeChallenge: (id: string) => void;
  resetApp: () => void;
  isCloudMode: boolean;
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
  
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  // Identify running mode
  const isCloudMode = isSupabaseConfigured;

  // ----------------------------------------------------
  // CLOUD DATABASE SYNC LOGIC (SUPABASE)
  // ----------------------------------------------------
  
  const loadSupabaseData = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileErr) {
        console.error('Error fetching profile:', profileErr);
        return;
      }

      if (profile) {
        setUserProfile(profile.onboarding_data);
        setCalculationResult(profile.calculation_result);
        setEcoPoints(profile.eco_points || 0);
      } else {
        setUserProfile(null);
        setCalculationResult(null);
        setEcoPoints(0);
      }

      // 2. Fetch History
      const { data: histData } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId);
      if (histData && histData.length > 0) {
        // Sort by week index (Week 1, Week 2...)
        const sorted = [...histData].sort((a, b) => a.week.localeCompare(b.week));
        setHistory(sorted.map(h => ({
          week: h.week,
          date: h.date,
          co2Emissions: h.co2_emissions,
          breakdown: h.breakdown,
          ecoPoints: h.eco_points
        })));
      } else {
        setHistory([]);
      }

      // 3. Fetch Goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      if (goalsData) {
        setGoals(goalsData.map(g => ({
          id: g.id,
          category: g.category as any,
          title: g.title,
          targetValue: Number(g.target_value),
          currentValue: Number(g.current_value),
          unit: g.unit,
          co2Savings: Number(g.co2_savings),
          isCompleted: g.is_completed,
          createdAt: g.created_at
        })));
      } else {
        setGoals([]);
      }

      // 4. Fetch Challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId);
      if (challengesData) {
        setChallenges(challengesData.map(c => ({
          id: c.id,
          category: c.category as any,
          title: c.title,
          description: c.description,
          pointsReward: c.points_reward,
          co2Savings: Number(c.co2_savings),
          isCompleted: c.is_completed,
          completedAt: c.completed_at || undefined,
          priority: c.priority as any
        })));
      } else {
        setChallenges([]);
      }

      // 5. Fetch Badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId);
      if (badgesData && badgesData.length > 0) {
        setBadges(badgesData.map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          iconName: b.icon_name,
          isEarned: b.is_earned,
          earnedAt: b.earned_at || undefined
        })));
      } else {
        setBadges(INITIAL_BADGES);
      }

    } catch (err) {
      console.error('Failed to load user data from Supabase:', err);
    }
  };

  // Listen to Supabase Auth state changes if cloud mode is enabled
  useEffect(() => {
    if (!isCloudMode) return;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';
        setCurrentUser({ name, email });
        setSupabaseUserId(session.user.id);
        setIsAuthenticated(true);
        loadSupabaseData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.name || email.split('@')[0] || 'User';
        setCurrentUser({ name, email });
        setSupabaseUserId(session.user.id);
        setIsAuthenticated(true);
        await loadSupabaseData(session.user.id);
      } else {
        setCurrentUser(null);
        setSupabaseUserId(null);
        setIsAuthenticated(false);
        setUserProfile(null);
        setCalculationResult(null);
        setHistory([]);
        setGoals([]);
        setChallenges([]);
        setEcoPoints(0);
        setBadges(INITIAL_BADGES);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isCloudMode]);


  // ----------------------------------------------------
  // LOCAL STORAGE STATE MANAGEMENT (FALLBACK MODE)
  // ----------------------------------------------------
  
  // Initialize Auth & Seeds on mount (localStorage fallback only)
  useEffect(() => {
    if (isCloudMode) return; // Skip if in cloud database mode

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
        passwordHash: 'password123'
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
  }, [isCloudMode]);

  // Load user segregated localStorage state when auth changes (localStorage fallback only)
  useEffect(() => {
    if (isCloudMode) return; // Skip if in cloud database mode
    
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
  }, [currentUser, isCloudMode]);

  // Save updates to user segregated localStorage (localStorage fallback only)
  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    if (userProfile) localStorage.setItem(`ecotrack_profile_${email}`, JSON.stringify(userProfile));
    else localStorage.removeItem(`ecotrack_profile_${email}`);
  }, [userProfile, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    if (calculationResult) localStorage.setItem(`ecotrack_result_${email}`, JSON.stringify(calculationResult));
    else localStorage.removeItem(`ecotrack_result_${email}`);
  }, [calculationResult, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    if (history.length > 0) localStorage.setItem(`ecotrack_history_${email}`, JSON.stringify(history));
    else localStorage.removeItem(`ecotrack_history_${email}`);
  }, [history, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_goals_${email}`, JSON.stringify(goals));
  }, [goals, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_challenges_${email}`, JSON.stringify(challenges));
  }, [challenges, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_points_${email}`, ecoPoints.toString());
  }, [ecoPoints, currentUser, isCloudMode]);

  useEffect(() => {
    if (isCloudMode || !currentUser) return;
    const email = currentUser.email;
    localStorage.setItem(`ecotrack_badges_${email}`, JSON.stringify(badges));
  }, [badges, currentUser, isCloudMode]);


  // ----------------------------------------------------
  // CONTEXT HANDLERS (HYBRID WRAPPERS)
  // ----------------------------------------------------
  
  const login = async (email: string, password: string) => {
    if (isCloudMode) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
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
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    if (isCloudMode) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
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
    }
  };

  const loginWithGoogle = async () => {
    if (isCloudMode) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      console.warn('Google login only available in Supabase cloud database mode.');
    }
  };

  const loginWithGithub = async () => {
    if (isCloudMode) {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      console.warn('GitHub login only available in Supabase cloud database mode.');
    }
  };

  const logout = async () => {
    if (isCloudMode) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('ecotrack_session');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Level Logic
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

  const submitOnboarding = async (data: OnboardingData) => {
    const result = calculateFootprint(data);
    
    // Calculate priorities for challenges
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

    let points = 500;
    let currentBadges = [...INITIAL_BADGES];
    currentBadges = unlockBadge('first_step', currentBadges);
    points += 100; // Bonus points
    currentBadges = unlockBadge('consistent_champion', currentBadges);

    // Default transit goal
    const newGoals: Goal[] = [
      {
        id: 'g1',
        category: 'transport',
        title: 'Ride Public Transit 3x Weekly',
        targetValue: 3,
        currentValue: 0,
        unit: 'times/week',
        co2Savings: 160,
        isCompleted: false,
        createdAt: new Date().toISOString().split('T')[0]
      }
    ];

    if (isCloudMode && supabaseUserId) {
      try {
        // 1. Update profiles table
        await supabase
          .from('profiles')
          .update({
            onboarding_data: data,
            calculation_result: result,
            eco_points: points
          })
          .eq('id', supabaseUserId);

        // 2. Insert challenges
        const challengeInserts = initializedChallenges.map(c => ({
          id: c.id,
          user_id: supabaseUserId,
          category: c.category,
          title: c.title,
          description: c.description,
          points_reward: c.pointsReward,
          co2_savings: c.co2Savings,
          is_completed: c.isCompleted,
          priority: c.priority
        }));
        await supabase.from('challenges').insert(challengeInserts);

        // 3. Insert goals
        const goalInserts = newGoals.map(g => ({
          id: g.id,
          user_id: supabaseUserId,
          category: g.category,
          title: g.title,
          target_value: g.targetValue,
          current_value: g.currentValue,
          unit: g.unit,
          co2_savings: g.co2Savings,
          is_completed: g.isCompleted,
          created_at: g.createdAt
        }));
        await supabase.from('goals').insert(goalInserts);

        // 4. Insert history
        const historyInserts = mockHistory.map(h => ({
          user_id: supabaseUserId,
          week: h.week,
          date: h.date,
          co2_emissions: h.co2Emissions,
          breakdown: h.breakdown,
          eco_points: h.ecoPoints
        }));
        await supabase.from('history').insert(historyInserts);

        // 5. Insert badges
        const badgeInserts = currentBadges.map(b => ({
          id: b.id,
          user_id: supabaseUserId,
          title: b.title,
          description: b.description,
          icon_name: b.iconName,
          is_earned: b.isEarned,
          earned_at: b.earnedAt || null
        }));
        await supabase.from('badges').insert(badgeInserts);

        // Refresh UI state
        setUserProfile(data);
        setCalculationResult(result);
        setChallenges(initializedChallenges);
        setGoals(newGoals);
        setHistory(mockHistory);
        setEcoPoints(points);
        setBadges(currentBadges);

      } catch (err) {
        console.error('Failed to save onboarding to database:', err);
      }
    } else {
      setUserProfile(data);
      setCalculationResult(result);
      setChallenges(initializedChallenges);
      setGoals(newGoals);
      setHistory(mockHistory);
      setEcoPoints(points);
      setBadges(currentBadges);
    }
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'isCompleted' | 'currentValue' | 'createdAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substring(2, 9),
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isCloudMode && supabaseUserId) {
      try {
        await supabase.from('goals').insert({
          id: goal.id,
          user_id: supabaseUserId,
          category: goal.category,
          title: goal.title,
          target_value: goal.targetValue,
          current_value: goal.currentValue,
          unit: goal.unit,
          co2_savings: goal.co2Savings,
          is_completed: goal.isCompleted,
          created_at: goal.createdAt
        });
        setGoals(prev => [goal, ...prev]);
      } catch (err) {
        console.error('Failed to add goal:', err);
      }
    } else {
      setGoals(prev => [goal, ...prev]);
    }
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    // Find goal first
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;

    const isNowCompleted = progress >= targetGoal.targetValue;
    const wasCompleted = targetGoal.isCompleted;
    let pointDiff = 0;
    
    if (isNowCompleted && !wasCompleted) {
      pointDiff = 100;
    }

    if (isCloudMode && supabaseUserId) {
      try {
        // Update goals
        await supabase
          .from('goals')
          .update({
            current_value: progress,
            is_completed: isNowCompleted
          })
          .eq('id', id);

        if (pointDiff > 0) {
          // Update profile points
          const nextPoints = ecoPoints + pointDiff;
          await supabase
            .from('profiles')
            .update({ eco_points: nextPoints })
            .eq('id', supabaseUserId);
          setEcoPoints(nextPoints);

          // Update badges
          let updatedBadges = [...badges];
          if (targetGoal.category === 'transport') updatedBadges = unlockBadge('green_commuter', updatedBadges);
          if (targetGoal.category === 'energy') updatedBadges = unlockBadge('energy_saver', updatedBadges);
          if (targetGoal.category === 'food') updatedBadges = unlockBadge('plant_powered', updatedBadges);
          if (targetGoal.category === 'consumption') updatedBadges = unlockBadge('waste_warrior', updatedBadges);

          const completedCount = goals.filter(g => g.isCompleted || g.id === id).length;
          if (completedCount >= 3) {
            updatedBadges = unlockBadge('goal_crusher', updatedBadges);
          }

          // Save badges to database
          for (const b of updatedBadges) {
            if (b.isEarned) {
              await supabase
                .from('badges')
                .update({ is_earned: true, earned_at: b.earnedAt || new Date().toISOString().split('T')[0] })
                .eq('id', b.id)
                .eq('user_id', supabaseUserId);
            }
          }
          setBadges(updatedBadges);
        }

        // Update local state goal
        setGoals(prev => prev.map(g => g.id === id ? { ...g, currentValue: progress, isCompleted: isNowCompleted } : g));

      } catch (err) {
        console.error('Failed to update goal progress:', err);
      }
    } else {
      setGoals(prev => prev.map(goal => {
        if (goal.id === id) {
          if (isNowCompleted && !wasCompleted) {
            setEcoPoints(pts => pts + pointDiff);
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
    }
  };

  const deleteGoal = async (id: string) => {
    if (isCloudMode && supabaseUserId) {
      try {
        await supabase.from('goals').delete().eq('id', id);
        setGoals(prev => prev.filter(g => g.id !== id));
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    } else {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const completeChallenge = async (id: string) => {
    const targetChallenge = challenges.find(ch => ch.id === id);
    if (!targetChallenge || targetChallenge.isCompleted) return;

    const pointsReward = targetChallenge.pointsReward;
    const completionDate = new Date().toISOString().split('T')[0];

    if (isCloudMode && supabaseUserId) {
      try {
        // Update challenge
        await supabase
          .from('challenges')
          .update({
            is_completed: true,
            completed_at: completionDate
          })
          .eq('id', id);

        // Update profile points
        const nextPoints = ecoPoints + pointsReward;
        await supabase
          .from('profiles')
          .update({ eco_points: nextPoints })
          .eq('id', supabaseUserId);
        setEcoPoints(nextPoints);

        // Unlock badges
        let updatedBadges = [...badges];
        if (targetChallenge.category === 'transport') updatedBadges = unlockBadge('green_commuter', updatedBadges);
        if (targetChallenge.category === 'energy') updatedBadges = unlockBadge('energy_saver', updatedBadges);
        if (targetChallenge.category === 'food') updatedBadges = unlockBadge('plant_powered', updatedBadges);
        if (targetChallenge.category === 'consumption') updatedBadges = unlockBadge('waste_warrior', updatedBadges);

        for (const b of updatedBadges) {
          if (b.isEarned) {
            await supabase
              .from('badges')
              .update({ is_earned: true, earned_at: b.earnedAt || completionDate })
              .eq('id', b.id)
              .eq('user_id', supabaseUserId);
          }
        }
        setBadges(updatedBadges);

        // Update local state challenges
        setChallenges(prev => prev.map(ch => ch.id === id ? { ...ch, isCompleted: true, completedAt: completionDate } : ch));

      } catch (err) {
        console.error('Failed to complete challenge:', err);
      }
    } else {
      setChallenges(prev => prev.map(ch => {
        if (ch.id === id && !ch.isCompleted) {
          setEcoPoints(pts => pts + pointsReward);

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
            completedAt: completionDate
          };
        }
        return ch;
      }));
    }
  };

  const resetApp = async () => {
    if (isCloudMode && supabaseUserId) {
      try {
        // Delete records associated with user
        await supabase.from('history').delete().eq('user_id', supabaseUserId);
        await supabase.from('goals').delete().eq('user_id', supabaseUserId);
        await supabase.from('challenges').delete().eq('user_id', supabaseUserId);
        await supabase.from('badges').delete().eq('user_id', supabaseUserId);

        // Reset profile
        await supabase
          .from('profiles')
          .update({
            onboarding_data: null,
            calculation_result: null,
            eco_points: 0
          })
          .eq('id', supabaseUserId);

        setUserProfile(null);
        setCalculationResult(null);
        setHistory([]);
        setGoals([]);
        setChallenges([]);
        setEcoPoints(0);
        setBadges(INITIAL_BADGES);

      } catch (err) {
        console.error('Failed to reset app:', err);
      }
    } else {
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
    }
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
        loginWithGoogle,
        loginWithGithub,
        logout,
        submitOnboarding,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        completeChallenge,
        resetApp,
        isCloudMode
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
