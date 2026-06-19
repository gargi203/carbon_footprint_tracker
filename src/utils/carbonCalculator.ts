export interface OnboardingData {
  // Transportation
  commuteDistance: number; // km per day
  vehicleType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'motorcycle' | 'none';
  publicTransport: 'daily' | 'often' | 'rarely' | 'never';
  flightsShort: number; // flights per year (< 3 hours)
  flightsLong: number; // flights per year (> 3 hours)

  // Energy
  electricityUsage: number; // kWh per month
  renewableEnergy: number; // percentage (0 - 100)
  acUsage: number; // hours per day

  // Food
  dietType: 'vegan' | 'vegetarian' | 'mixed' | 'meat-heavy';

  // Shopping & Waste
  shoppingFrequency: 'rare' | 'average' | 'frequent';
  recyclingHabits: 'all' | 'some' | 'none';
  plasticUsage: 'low' | 'medium' | 'high';
}

export interface EmissionBreakdown {
  transport: number; // kg CO2 / year
  energy: number; // kg CO2 / year
  food: number; // kg CO2 / year
  consumption: number; // kg CO2 / year
  total: number; // kg CO2 / year
}

export type SustainabilityRating = 'Excellent' | 'Good' | 'Average' | 'High Impact';

export interface CalculationResult {
  breakdown: EmissionBreakdown;
  sustainabilityScore: number; // 0 - 100 (higher is better)
  rating: SustainabilityRating;
}

// Constants for emission factors (in kg CO2)
export const FACTORS = {
  // Transportation
  vehicle: {
    petrol: 0.18,      // kg CO2 per km
    diesel: 0.17,      // kg CO2 per km
    hybrid: 0.11,      // kg CO2 per km
    electric: 0.04,    // kg CO2 per km (assuming average grid electricity)
    motorcycle: 0.10,  // kg CO2 per km
    none: 0,
  },
  publicTransport: {
    daily: 20 * 365 * 0.03,   // Daily commute of ~20km on public transit (bus/train)
    often: 10 * 365 * 0.03,   // Multi-weekly commute
    rarely: 2 * 365 * 0.03,   // Intermittent usage
    never: 0,
  },
  flights: {
    short: 450,  // kg CO2 per short flight (< 3h)
    long: 1400,  // kg CO2 per long flight (> 3h)
  },

  // Energy
  electricityGrid: 0.45, // kg CO2 per kWh
  acPowerKW: 1.2,        // Average AC energy consumption in kW

  // Food
  diet: {
    vegan: 900,       // kg CO2 per year
    vegetarian: 1400,  // kg CO2 per year
    mixed: 2400,       // kg CO2 per year
    'meat-heavy': 3300, // kg CO2 per year
  },

  // Consumption
  shopping: {
    rare: 150,     // kg CO2 per year
    average: 450,  // kg CO2 per year
    frequent: 900, // kg CO2 per year
  },
  wasteBase: 350,   // Base waste kg CO2 per year
  recyclingReduction: {
    all: 280,   // Saves ~80% of waste carbon
    some: 140,  // Saves ~40% of waste carbon
    none: 0,
  },
  plastic: {
    low: 40,
    medium: 120,
    high: 250,
  }
};

/**
 * Calculates carbon emissions based on user lifestyle choices.
 */
export function calculateFootprint(data: OnboardingData): CalculationResult {
  // 1. Transportation
  const commuteAnnualDistance = data.commuteDistance * 365;
  const commuteEmissions = commuteAnnualDistance * FACTORS.vehicle[data.vehicleType];
  const transitEmissions = FACTORS.publicTransport[data.publicTransport];
  const flightEmissions = (data.flightsShort * FACTORS.flights.short) + (data.flightsLong * FACTORS.flights.long);
  const transport = Math.round(commuteEmissions + transitEmissions + flightEmissions);

  // 2. Energy
  const baseElectricityAnnual = data.electricityUsage * 12 * FACTORS.electricityGrid;
  const renewableSavings = baseElectricityAnnual * (data.renewableEnergy / 100);
  const electricityEmissions = baseElectricityAnnual - renewableSavings;

  const acAnnualKWh = data.acUsage * 365 * FACTORS.acPowerKW;
  // Apply same renewable energy offset to AC usage since it pulls from same home grid
  const acEmissions = (acAnnualKWh * FACTORS.electricityGrid) * (1 - data.renewableEnergy / 100);
  const energy = Math.round(electricityEmissions + acEmissions);

  // 3. Food
  const food = FACTORS.diet[data.dietType];

  // 4. Consumption (Shopping & Waste)
  const shopEmissions = FACTORS.shopping[data.shoppingFrequency];
  const wasteEmissions = Math.max(0, FACTORS.wasteBase - FACTORS.recyclingReduction[data.recyclingHabits]);
  const plasticEmissions = FACTORS.plastic[data.plasticUsage];
  const consumption = Math.round(shopEmissions + wasteEmissions + plasticEmissions);

  const total = transport + energy + food + consumption;

  const breakdown: EmissionBreakdown = {
    transport,
    energy,
    food,
    consumption,
    total
  };

  // Sustainability score from 0 to 100 (where 100 is best: <= 1.5 tons CO2, 0 is worst: >= 16 tons CO2)
  // Let's use a scale: <= 1500 kg is 100 points, >= 15000 kg is 0 points.
  const minEmissions = 1500;
  const maxEmissions = 15000;
  
  let sustainabilityScore = 100;
  if (total > minEmissions) {
    sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - ((total - minEmissions) / (maxEmissions - minEmissions)) * 100)));
  }

  // Ratings based on total emissions in metric tons
  // Excellent: < 3 tons (3000 kg)
  // Good: 3 - 6 tons (3000 - 6000 kg)
  // Average: 6 - 11 tons (6000 - 11000 kg)
  // High Impact: > 11 tons (11000 kg)
  let rating: SustainabilityRating = 'Average';
  if (total < 3000) {
    rating = 'Excellent';
  } else if (total < 6000) {
    rating = 'Good';
  } else if (total <= 11000) {
    rating = 'Average';
  } else {
    rating = 'High Impact';
  }

  return {
    breakdown,
    sustainabilityScore,
    rating
  };
}

/**
 * Returns eco-equivalencies for carbon emissions to make the data relatable
 */
export interface CarbonEquivalency {
  treesPlanted: number;
  smartphoneCharges: number;
  carMilesDriven: number;
}

export function getCarbonEquivalencies(kgCO2: number): CarbonEquivalency {
  return {
    // 1 mature tree absorbs ~22kg of CO2 per year
    treesPlanted: Math.round(kgCO2 / 22),
    // 1 charge of a smartphone creates ~0.008 kg of CO2
    smartphoneCharges: Math.round(kgCO2 / 0.0083),
    // 1 km driven in average petrol car is ~0.18 kg CO2
    carMilesDriven: Math.round(kgCO2 / 0.18)
  };
}
