export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  difficulty: number;
}

export interface Temptation {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  temptationLevel: number;
}

export const SAVINGS_GOALS: SavingsGoal[] = [
  { id: "toy-car", name: "Toy Car", emoji: "🚗", targetAmount: 10, difficulty: 1 },
  { id: "teddy", name: "Teddy Bear", emoji: "🧸", targetAmount: 15, difficulty: 1 },
  { id: "ball", name: "Football", emoji: "⚽", targetAmount: 20, difficulty: 2 },
  { id: "lego", name: "Lego Set", emoji: "🧱", targetAmount: 30, difficulty: 2 },
  { id: "headphones", name: "Headphones", emoji: "🎧", targetAmount: 40, difficulty: 3 },
  { id: "skateboard", name: "Skateboard", emoji: "🛹", targetAmount: 50, difficulty: 3 },
  { id: "bicycle", name: "Bicycle", emoji: "🚲", targetAmount: 75, difficulty: 4 },
  { id: "tablet", name: "Tablet", emoji: "📱", targetAmount: 100, difficulty: 5 },
  { id: "gaming", name: "Gaming Console", emoji: "🎮", targetAmount: 150, difficulty: 6 },
  { id: "camera", name: "Camera", emoji: "📷", targetAmount: 200, difficulty: 7 },
];

export const TEMPTATIONS: Temptation[] = [
  { id: "candy", name: "Candy", emoji: "🍬", cost: 1, temptationLevel: 1 },
  { id: "gum", name: "Bubble Gum", emoji: "🫧", cost: 1, temptationLevel: 1 },
  { id: "sticker", name: "Stickers", emoji: "⭐", cost: 2, temptationLevel: 2 },
  { id: "ice-cream", name: "Ice Cream", emoji: "🍦", cost: 3, temptationLevel: 3 },
  { id: "comic", name: "Comic Book", emoji: "📖", cost: 5, temptationLevel: 4 },
  { id: "snack", name: "Snack Pack", emoji: "🍿", cost: 4, temptationLevel: 3 },
  { id: "drink", name: "Fancy Drink", emoji: "🧃", cost: 3, temptationLevel: 2 },
  { id: "small-toy", name: "Small Toy", emoji: "🎲", cost: 8, temptationLevel: 5 },
  { id: "arcade", name: "Arcade Game", emoji: "🕹️", cost: 5, temptationLevel: 4 },
  { id: "chocolate", name: "Chocolate Bar", emoji: "🍫", cost: 2, temptationLevel: 3 },
];

export interface PiggyBankRound {
  earnedAmount: number;
  temptation: Temptation | null;
  scenario: string;
}

export function generatePiggyBankGame(difficulty: number): {
  goal: SavingsGoal;
  rounds: PiggyBankRound[];
  totalRounds: number;
} {
  const eligibleGoals = SAVINGS_GOALS.filter(
    (g) => g.difficulty <= Math.min(difficulty + 1, 7) && g.difficulty >= Math.max(1, difficulty - 2)
  );
  const goal = eligibleGoals[Math.floor(Math.random() * eligibleGoals.length)] || SAVINGS_GOALS[0];

  const totalRounds = difficulty <= 3 ? 6 : difficulty <= 6 ? 8 : 10;
  
  const baseEarning = Math.ceil(goal.targetAmount / totalRounds) + Math.floor(difficulty / 2);
  
  const scenarios = [
    "You helped with chores!",
    "You got pocket money!",
    "Grandma gave you money!",
    "You found coins!",
    "You did extra work!",
    "Birthday money arrived!",
    "You earned a reward!",
    "Allowance day!",
  ];

  const rounds: PiggyBankRound[] = [];
  
  for (let i = 0; i < totalRounds; i++) {
    const variance = Math.floor(Math.random() * 5) - 2;
    const earnedAmount = Math.max(1, baseEarning + variance);
    
    const hasTemptation = i > 0 && Math.random() < 0.6;
    const eligibleTemptations = TEMPTATIONS.filter(
      (t) => t.cost <= earnedAmount + 5 && t.temptationLevel <= difficulty + 2
    );
    const temptation = hasTemptation && eligibleTemptations.length > 0
      ? eligibleTemptations[Math.floor(Math.random() * eligibleTemptations.length)]
      : null;

    rounds.push({
      earnedAmount,
      temptation,
      scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
    });
  }

  return { goal, rounds, totalRounds };
}
