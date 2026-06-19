import type { UserFootprint, CategoryBreakdown, EcoAction, InsightTip } from "./types";

// Coefficients in kg CO2e — sourced from common public datasets (DEFRA / EPA averages).
const COEF = {
  carPerKm: 0.171, // average petrol car
  flightPerTrip: 500, // medium-haul return flight average
  transitPerKm: 0.04,
  electricityPerKwh: 0.42,
  gasPerKwh: 0.2,
  dietAnnual: {
    vegan: 1000,
    vegetarian: 1700,
    pescatarian: 2100,
    omnivore: 2900,
    heavy_meat: 3700,
  },
  foodWasteFactor: 80, // per level point per year
  shoppingFactor: 320, // per level point per year
  recycleOffset: 4, // per percent per year
} as const;

const clamp = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

export function computeBreakdown(f: UserFootprint): CategoryBreakdown {
  const travel =
    clamp(f.travel.carKmPerWeek, 0, 5000) * 52 * COEF.carPerKm +
    clamp(f.travel.flightsPerYear, 0, 50) * COEF.flightPerTrip +
    clamp(f.travel.publicTransitKmPerWeek, 0, 5000) * 52 * COEF.transitPerKm;

  const renewableFactor = 1 - clamp(f.home.renewablePercent, 0, 100) / 100;
  const home =
    clamp(f.home.electricityKwhPerMonth, 0, 20000) * 12 * COEF.electricityPerKwh * renewableFactor +
    clamp(f.home.gasKwhPerMonth, 0, 20000) * 12 * COEF.gasPerKwh;

  const diet =
    COEF.dietAnnual[f.diet.type] + clamp(f.diet.foodWasteLevel, 1, 5) * COEF.foodWasteFactor;

  const consumption = Math.max(
    0,
    clamp(f.consumption.shoppingLevel, 1, 5) * COEF.shoppingFactor -
      clamp(f.consumption.recyclesPercent, 0, 100) * COEF.recycleOffset,
  );

  return {
    travel: Math.round(travel),
    home: Math.round(home),
    diet: Math.round(diet),
    consumption: Math.round(consumption),
  };
}

export function totalKg(b: CategoryBreakdown): number {
  return b.travel + b.home + b.diet + b.consumption;
}

export function highestCategory(b: CategoryBreakdown): keyof CategoryBreakdown {
  return (Object.entries(b) as [keyof CategoryBreakdown, number][]).sort(
    (a, z) => z[1] - a[1],
  )[0][0];
}

export const COMPARISON_AVERAGES = [
  { label: "You", short: "You" },
  { label: "National (avg.)", kg: 7700, short: "Nat." },
  { label: "Global (avg.)", kg: 4700, short: "Global" },
  { label: "Paris Goal 2030", kg: 2300, short: "2030" },
] as const;

export const ECO_ACTIONS: EcoAction[] = [
  {
    id: "meatless",
    title: "Meatless Day",
    description: "Skip all meat & fish for a full day.",
    category: "diet",
    points: 25,
    co2SavedKg: 4.2,
    icon: "Leaf",
  },
  {
    id: "bike",
    title: "Commute by Bike",
    description: "Replace a car commute with cycling.",
    category: "travel",
    points: 30,
    co2SavedKg: 3.6,
    icon: "Bike",
  },
  {
    id: "unplug",
    title: "Unplug Idle Electronics",
    description: "Cut phantom load from devices overnight.",
    category: "home",
    points: 10,
    co2SavedKg: 0.8,
    icon: "PlugZap",
  },
  {
    id: "secondhand",
    title: "Buy Secondhand",
    description: "Choose pre-loved over new today.",
    category: "consumption",
    points: 20,
    co2SavedKg: 2.5,
    icon: "ShoppingBag",
  },
  {
    id: "shortshower",
    title: "5-Minute Shower",
    description: "Keep showers under 5 minutes.",
    category: "home",
    points: 8,
    co2SavedKg: 0.6,
    icon: "ShowerHead",
  },
  {
    id: "transit",
    title: "Take Public Transit",
    description: "Swap a car trip for bus or train.",
    category: "travel",
    points: 18,
    co2SavedKg: 2.1,
    icon: "TramFront",
  },
  {
    id: "leftovers",
    title: "Zero Food Waste",
    description: "Eat all leftovers, compost the rest.",
    category: "diet",
    points: 12,
    co2SavedKg: 1.1,
    icon: "Salad",
  },
  {
    id: "linedry",
    title: "Line-Dry Laundry",
    description: "Skip the tumble dryer today.",
    category: "home",
    points: 14,
    co2SavedKg: 1.4,
    icon: "Wind",
  },
];

const INSIGHT_LIB: Record<keyof CategoryBreakdown, InsightTip[]> = {
  travel: [
    {
      id: "t1",
      category: "travel",
      title: "Switch one weekly car trip to transit",
      body: "Replacing one 25 km car commute per week with rail or bus saves roughly 180 kg CO2e per year.",
      impactKg: 180,
      difficulty: "easy",
    },
    {
      id: "t2",
      category: "travel",
      title: "Trial an EV or hybrid for your next car",
      body: "An EV charged from a typical grid emits ~60% less CO2e per km than a petrol equivalent.",
      impactKg: 850,
      difficulty: "ambitious",
    },
    {
      id: "t3",
      category: "travel",
      title: "Replace one short-haul flight with rail",
      body: "A return short-haul flight emits roughly 500 kg CO2e — high-speed rail is ~90% lower.",
      impactKg: 450,
      difficulty: "medium",
    },
  ],
  home: [
    {
      id: "h1",
      category: "home",
      title: "Switch to a renewable energy tariff",
      body: "Moving to a verified green tariff can eliminate the majority of your electricity emissions overnight.",
      impactKg: 1200,
      difficulty: "easy",
    },
    {
      id: "h2",
      category: "home",
      title: "Lower thermostat by 1°C",
      body: "Each degree reduction trims around 7% off heating energy — typically 250 kg CO2e per year.",
      impactKg: 250,
      difficulty: "easy",
    },
    {
      id: "h3",
      category: "home",
      title: "Insulate roof & draught-proof doors",
      body: "Upgrading insulation pays back in 2–4 years and removes ~600 kg CO2e annually.",
      impactKg: 600,
      difficulty: "ambitious",
    },
  ],
  diet: [
    {
      id: "d1",
      category: "diet",
      title: "Adopt two plant-based days per week",
      body: "Two meatless days weekly cuts roughly 430 kg CO2e per year for an omnivore.",
      impactKg: 430,
      difficulty: "easy",
    },
    {
      id: "d2",
      category: "diet",
      title: "Halve red-meat intake",
      body: "Red meat accounts for the bulk of dietary emissions — halving it saves ~600 kg/yr.",
      impactKg: 600,
      difficulty: "medium",
    },
    {
      id: "d3",
      category: "diet",
      title: "Plan meals to cut food waste",
      body: "A weekly meal plan typically removes 25% of household food waste, ~150 kg CO2e/yr.",
      impactKg: 150,
      difficulty: "easy",
    },
  ],
  consumption: [
    {
      id: "c1",
      category: "consumption",
      title: "Adopt a one-in, one-out rule",
      body: "Curbing impulse purchases reduces embodied emissions by ~280 kg CO2e per year.",
      impactKg: 280,
      difficulty: "easy",
    },
    {
      id: "c2",
      category: "consumption",
      title: "Buy refurbished electronics",
      body: "Refurbished phones & laptops cut embodied emissions by 75% vs new devices.",
      impactKg: 200,
      difficulty: "easy",
    },
    {
      id: "c3",
      category: "consumption",
      title: "Repair before replacing",
      body: "Extending product life by 1 year typically removes 20% of its lifecycle emissions.",
      impactKg: 180,
      difficulty: "medium",
    },
  ],
};

export function getInsightsFor(b: CategoryBreakdown): InsightTip[] {
  const ordered = (Object.keys(b) as (keyof CategoryBreakdown)[]).sort((a, z) => b[z] - b[a]);
  return ordered.flatMap((k) => INSIGHT_LIB[k]);
}
