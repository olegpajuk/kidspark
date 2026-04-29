export type Weather = "sunny" | "cloudy" | "rainy" | "hot";

export interface WeatherData {
  type: Weather;
  emoji: string;
  name: string;
  demandMultiplier: number;
}

export const WEATHER_TYPES: WeatherData[] = [
  { type: "sunny", emoji: "☀️", name: "Sunny", demandMultiplier: 1.2 },
  { type: "cloudy", emoji: "⛅", name: "Cloudy", demandMultiplier: 0.9 },
  { type: "rainy", emoji: "🌧️", name: "Rainy", demandMultiplier: 0.5 },
  { type: "hot", emoji: "🔥", name: "Very Hot", demandMultiplier: 1.5 },
];

export interface Supply {
  id: string;
  name: string;
  emoji: string;
  costPerUnit: number;
  unitsPerCup: number;
}

export const SUPPLIES: Supply[] = [
  { id: "lemons", name: "Lemons", emoji: "🍋", costPerUnit: 0.50, unitsPerCup: 0.25 },
  { id: "sugar", name: "Sugar", emoji: "🍬", costPerUnit: 0.30, unitsPerCup: 0.10 },
  { id: "cups", name: "Cups", emoji: "🥤", costPerUnit: 0.10, unitsPerCup: 1 },
  { id: "ice", name: "Ice", emoji: "🧊", costPerUnit: 0.20, unitsPerCup: 0.20 },
];

export interface DayResult {
  day: number;
  weather: WeatherData;
  pricePerCup: number;
  supplyCost: number;
  cupsSold: number;
  revenue: number;
  profit: number;
  customersHappy: number;
  customersSad: number;
}

export interface LemonadeGameState {
  day: number;
  totalDays: number;
  cash: number;
  weather: WeatherData;
  pricePerCup: number;
  inventory: Record<string, number>;
  dayResults: DayResult[];
}

export function calculateCostPerCup(): number {
  return SUPPLIES.reduce((sum, supply) => sum + supply.costPerUnit * supply.unitsPerCup, 0);
}

export function calculateDemand(
  price: number,
  weather: WeatherData,
  difficulty: number
): number {
  const baseDemand = 10 + difficulty * 3;
  
  const priceImpact = Math.max(0, 1 - (price - 0.50) * 0.4);
  
  const weatherDemand = baseDemand * weather.demandMultiplier * priceImpact;
  
  const variance = (Math.random() - 0.5) * 4;
  
  return Math.max(0, Math.round(weatherDemand + variance));
}

export function simulateDay(
  price: number,
  cupsAvailable: number,
  weather: WeatherData,
  difficulty: number
): { sold: number; happy: number; sad: number } {
  const demand = calculateDemand(price, weather, difficulty);
  const sold = Math.min(demand, cupsAvailable);
  const happy = sold;
  const sad = Math.max(0, demand - sold);
  
  return { sold, happy, sad };
}

export function getRandomWeather(): WeatherData {
  const weights = [0.35, 0.30, 0.15, 0.20];
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return WEATHER_TYPES[i];
    }
  }
  
  return WEATHER_TYPES[0];
}

export function initializeLemonadeGame(difficulty: number): LemonadeGameState {
  const totalDays = difficulty <= 3 ? 3 : difficulty <= 6 ? 5 : 7;
  const startingCash = 10 + difficulty * 2;
  
  return {
    day: 1,
    totalDays,
    cash: startingCash,
    weather: getRandomWeather(),
    pricePerCup: 1.00,
    inventory: {
      lemons: 0,
      sugar: 0,
      cups: 0,
      ice: 0,
    },
    dayResults: [],
  };
}

export function calculateMaxCups(inventory: Record<string, number>): number {
  const cupsFromSupplies = SUPPLIES.map((supply) => {
    const available = inventory[supply.id] || 0;
    return Math.floor(available / supply.unitsPerCup);
  });
  
  return Math.min(...cupsFromSupplies);
}
