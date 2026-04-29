export interface Coin {
  id: string;
  name: string;
  value: number;
  emoji: string;
  color: string;
  bgColor: string;
  size: "small" | "medium" | "large";
}

export interface Bill {
  id: string;
  name: string;
  value: number;
  emoji: string;
  color: string;
  bgColor: string;
}

export const COINS: Coin[] = [
  {
    id: "penny",
    name: "1p",
    value: 0.01,
    emoji: "🪙",
    color: "#CD7F32",
    bgColor: "#FFF0E0",
    size: "small",
  },
  {
    id: "nickel",
    name: "5p",
    value: 0.05,
    emoji: "🪙",
    color: "#C0C0C0",
    bgColor: "#F5F5F5",
    size: "small",
  },
  {
    id: "dime",
    name: "10p",
    value: 0.10,
    emoji: "🪙",
    color: "#C0C0C0",
    bgColor: "#F0F0F0",
    size: "small",
  },
  {
    id: "quarter",
    name: "20p",
    value: 0.20,
    emoji: "🪙",
    color: "#C0C0C0",
    bgColor: "#E8E8E8",
    size: "medium",
  },
  {
    id: "fifty",
    name: "50p",
    value: 0.50,
    emoji: "🪙",
    color: "#C0C0C0",
    bgColor: "#E0E0E0",
    size: "medium",
  },
  {
    id: "pound",
    name: "£1",
    value: 1.00,
    emoji: "🪙",
    color: "#FFD700",
    bgColor: "#FFFBE6",
    size: "large",
  },
  {
    id: "twopound",
    name: "£2",
    value: 2.00,
    emoji: "🪙",
    color: "#FFD700",
    bgColor: "#FFF8DC",
    size: "large",
  },
];

export const BILLS: Bill[] = [
  {
    id: "five",
    name: "£5",
    value: 5.00,
    emoji: "💵",
    color: "#00A86B",
    bgColor: "#E8F5E9",
  },
  {
    id: "ten",
    name: "£10",
    value: 10.00,
    emoji: "💵",
    color: "#FF6B35",
    bgColor: "#FFF3E0",
  },
  {
    id: "twenty",
    name: "£20",
    value: 20.00,
    emoji: "💵",
    color: "#9C27B0",
    bgColor: "#F3E5F5",
  },
];

export function formatMoney(amount: number): string {
  if (amount >= 1) {
    return `£${amount.toFixed(2)}`;
  }
  return `${Math.round(amount * 100)}p`;
}

export function formatMoneyShort(amount: number): string {
  if (amount >= 1) {
    const pounds = Math.floor(amount);
    const pence = Math.round((amount - pounds) * 100);
    if (pence === 0) {
      return `£${pounds}`;
    }
    return `£${pounds}.${pence.toString().padStart(2, "0")}`;
  }
  return `${Math.round(amount * 100)}p`;
}

export interface CoinCounterQuestion {
  id: string;
  targetAmount: number;
  availableCoins: Coin[];
  availableBills: Bill[];
  difficulty: number;
}

export function generateCoinCounterQuestion(difficulty: number): CoinCounterQuestion {
  let minAmount: number;
  let maxAmount: number;
  let useCoinsOnly: boolean;
  let availableCoins: Coin[];
  let availableBills: Bill[];

  switch (difficulty) {
    case 1:
      minAmount = 0.05;
      maxAmount = 0.30;
      useCoinsOnly = true;
      availableCoins = COINS.filter((c) => c.value <= 0.10);
      availableBills = [];
      break;
    case 2:
      minAmount = 0.10;
      maxAmount = 0.50;
      useCoinsOnly = true;
      availableCoins = COINS.filter((c) => c.value <= 0.20);
      availableBills = [];
      break;
    case 3:
      minAmount = 0.20;
      maxAmount = 1.00;
      useCoinsOnly = true;
      availableCoins = COINS.filter((c) => c.value <= 0.50);
      availableBills = [];
      break;
    case 4:
      minAmount = 0.50;
      maxAmount = 2.00;
      useCoinsOnly = true;
      availableCoins = COINS;
      availableBills = [];
      break;
    case 5:
      minAmount = 1.00;
      maxAmount = 5.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS.filter((b) => b.value <= 5);
      break;
    case 6:
      minAmount = 2.00;
      maxAmount = 10.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS.filter((b) => b.value <= 10);
      break;
    case 7:
      minAmount = 5.00;
      maxAmount = 15.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS;
      break;
    case 8:
      minAmount = 10.00;
      maxAmount = 25.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS;
      break;
    case 9:
      minAmount = 15.00;
      maxAmount = 35.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS;
      break;
    case 10:
    default:
      minAmount = 20.00;
      maxAmount = 50.00;
      useCoinsOnly = false;
      availableCoins = COINS;
      availableBills = BILLS;
      break;
  }

  const step = difficulty <= 3 ? 0.05 : difficulty <= 5 ? 0.10 : 0.50;
  const steps = Math.floor((maxAmount - minAmount) / step);
  const randomSteps = Math.floor(Math.random() * (steps + 1));
  const targetAmount = Math.round((minAmount + randomSteps * step) * 100) / 100;

  return {
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetAmount,
    availableCoins,
    availableBills,
    difficulty,
  };
}
