import { type EmissionBreakdown, type OnboardingData, FACTORS } from '../utils/carbonCalculator';

export interface Recommendation {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'consumption';
  title: string;
  description: string;
  co2Savings: number; // kg CO2 / year saved
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: 'Low' | 'Medium' | 'High';
  rationale: string;
}

/**
 * Dynamic recommendation engine applying rule-based reasoning.
 * Sorts priority based on category emissions and user profile answers.
 */
export function generateRecommendations(
  breakdown: EmissionBreakdown,
  data: OnboardingData
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Gather all candidate recommendations based on rules
  
  // TRANSPORT RECOMMENDATIONS
  const commuteAnnual = data.commuteDistance * 365 * FACTORS.vehicle[data.vehicleType];
  const flightAnnual = (data.flightsShort * FACTORS.flights.short) + (data.flightsLong * FACTORS.flights.long);

  if (data.vehicleType !== 'none' && (data.vehicleType === 'petrol' || data.vehicleType === 'diesel')) {
    recommendations.push({
      id: 'switch_electric',
      category: 'transport',
      title: 'Switch to an Electric Vehicle (EV)',
      description: 'Transitioning from gas/diesel to electric reduces transport emissions by up to 75% depending on your power source.',
      co2Savings: Math.round(commuteAnnual * 0.75),
      difficulty: 'Hard',
      impact: 'High',
      rationale: `Since your vehicle type is ${data.vehicleType} and you travel ${data.commuteDistance} km daily, upgrading to an EV could save substantial emissions.`
    });

    if (data.commuteDistance > 10) {
      recommendations.push({
        id: 'carpool_hybrid',
        category: 'transport',
        title: 'Carpool or Work from Home 2 Days/Week',
        description: 'Reduce your daily commute distance by organizing car sharing or negotiating remote work days.',
        co2Savings: Math.round(commuteAnnual * (2 / 5)), // 40% of commute emissions
        difficulty: 'Easy',
        impact: 'Medium',
        rationale: 'Organizing a simple routine with colleagues or WFH decreases your direct fuel usage without major investment.'
      });
    }
  }

  if (data.publicTransport === 'rarely' || data.publicTransport === 'never') {
    recommendations.push({
      id: 'use_transit',
      category: 'transport',
      title: 'Shift 3 Commutes to Public Transit Weekly',
      description: 'Using buses, light rails, or subways is significantly more carbon-efficient per passenger-kilometer than single-occupancy driving.',
      co2Savings: Math.round(commuteAnnual * 0.35),
      difficulty: 'Medium',
      impact: 'Medium',
      rationale: 'Active public transport usage is an immediate, practical way to cut down on daily fuel emissions.'
    });
  }

  if (flightAnnual > 1000) {
    recommendations.push({
      id: 'reduce_flights',
      category: 'transport',
      title: 'Substitute 1 Long Flight with Virtual Meetings or Train',
      description: 'Aviation is highly intensive. Substituting short-haul domestic flights with rail or holding virtual meetings dramatically drops footprint.',
      co2Savings: data.flightsLong > 0 ? FACTORS.flights.long : FACTORS.flights.short,
      difficulty: 'Medium',
      impact: 'High',
      rationale: `You currently take ${data.flightsShort + data.flightsLong} flights per year, representing a large share of emissions.`
    });
  }

  // ENERGY RECOMMENDATIONS
  const baseElectricity = data.electricityUsage * 12 * FACTORS.electricityGrid;
  const acAnnual = data.acUsage * 365 * FACTORS.acPowerKW * FACTORS.electricityGrid;

  if (data.renewableEnergy < 50) {
    recommendations.push({
      id: 'switch_renewable',
      category: 'energy',
      title: 'Switch to a 100% Renewable Energy Plan',
      description: 'Transition your home electricity to green tariffs (solar/wind). Many utilities now offer clean power sourcing at matching rates.',
      co2Savings: Math.round(baseElectricity * (1 - data.renewableEnergy / 100)),
      difficulty: 'Easy',
      impact: 'High',
      rationale: `Only ${data.renewableEnergy}% of your electricity currently comes from renewables. Making the switch can neutralize your home's grid impact.`
    });
  }

  if (data.electricityUsage > 250) {
    recommendations.push({
      id: 'led_lighting',
      category: 'energy',
      title: 'Upgrade Home to LED Lighting',
      description: 'Replace standard incandescent or CFL bulbs with LEDs. They consume up to 80% less energy and last 25 times longer.',
      co2Savings: 180, // Average estimate for typical house
      difficulty: 'Easy',
      impact: 'Low',
      rationale: 'This is a low-cost, set-and-forget upgrade that immediately drops base electricity load.'
    });
  }

  if (data.acUsage > 2) {
    recommendations.push({
      id: 'ac_optimization',
      category: 'energy',
      title: 'Optimize Air Conditioning Usage',
      description: 'Set your thermostat to 24°C (75°F) or use smart timers. Clean your AC filters monthly to boost cooling efficiency by 15%.',
      co2Savings: Math.round(acAnnual * 0.15),
      difficulty: 'Easy',
      impact: 'Medium',
      rationale: `Operating air conditioning for ${data.acUsage} hours daily adds up. A 15% efficiency gain offers tangible savings.`
    });
  }

  // FOOD RECOMMENDATIONS
  if (data.dietType === 'meat-heavy' || data.dietType === 'mixed') {
    recommendations.push({
      id: 'meat_free_mondays',
      category: 'food',
      title: 'Adopt Meat-Free Mondays',
      description: 'Replacing meat (specifically beef and lamb) with plant-based alternatives just one day a week saves significant land and carbon.',
      co2Savings: 250,
      difficulty: 'Easy',
      impact: 'Medium',
      rationale: 'Red meat production generates extensive methane. Starting with one day a week is a simple habits builder.'
    });

    recommendations.push({
      id: 'shift_diet_veg',
      category: 'food',
      title: 'Shift to a Mostly Vegetarian/Vegan Diet',
      description: 'Transitioning to plant-centered eating is one of the most effective personal actions to combat habitat loss and climate change.',
      co2Savings: data.dietType === 'meat-heavy' ? 1900 : 1000,
      difficulty: 'Hard',
      impact: 'High',
      rationale: `Your ${data.dietType} diet yields an estimated ${FACTORS.diet[data.dietType]} kg CO2/year. Going vegetarian cuts this in half.`
    });
  }

  // CONSUMPTION RECOMMENDATIONS
  if (data.shoppingFrequency === 'frequent') {
    recommendations.push({
      id: 'conscious_shopping',
      category: 'consumption',
      title: 'Implement a "Conscious Buying" Filter',
      description: 'Wait 48 hours before non-essential purchases, and prefer secondhand or high-durability items to curb manufacture emissions.',
      co2Savings: 350,
      difficulty: 'Medium',
      impact: 'Medium',
      rationale: 'Frequent online shopping increases carbon from logistics, packaging, and high product turnover rates.'
    });
  }

  if (data.recyclingHabits !== 'all') {
    recommendations.push({
      id: 'full_recycling',
      category: 'consumption',
      title: 'Recycle All Paper, Glass, Metals, and Cardboard',
      description: 'Organize sorting bins in your house. Recycling diverts waste from decomposing landfills and decreases demand for raw materials.',
      co2Savings: data.recyclingHabits === 'none' ? 280 : 140,
      difficulty: 'Easy',
      impact: 'Medium',
      rationale: `Increasing your recycling habits from "${data.recyclingHabits}" to "all" prevents materials from turning into landfill methane.`
    });
  }

  if (data.plasticUsage === 'high' || data.plasticUsage === 'medium') {
    recommendations.push({
      id: 'reduce_plastic',
      category: 'consumption',
      title: 'Banish Single-Use Plastics',
      description: 'Use reusable grocery bags, water bottles, and beeswax wraps. Plastics are petroleum-derived and take centuries to break down.',
      co2Savings: 80,
      difficulty: 'Easy',
      impact: 'Low',
      rationale: 'Eliminating disposable plastic items reduces landfill mass and chemical microplastics in waterways.'
    });
  }

  // 2. Sort recommendations based on AI decision logic:
  // - Priority order:
  //   Category with highest percentage of emissions should have its recommendations displayed first.
  //   Let's calculate category percentages and sort.
  
  const total = breakdown.total || 1;
  const percentages = {
    transport: breakdown.transport / total,
    energy: breakdown.energy / total,
    food: breakdown.food / total,
    consumption: breakdown.consumption / total,
  };

  recommendations.sort((a, b) => {
    const pctA = percentages[a.category];
    const pctB = percentages[b.category];
    
    // Sort by category percentage descending
    if (pctA !== pctB) {
      return pctB - pctA;
    }
    
    // Fallback: sort by carbon savings descending
    return b.co2Savings - a.co2Savings;
  });

  return recommendations;
}
