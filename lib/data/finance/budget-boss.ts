export interface BudgetCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  minRequired: number;
  description: string;
}

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: "food",
    name: "Food",
    emoji: "🍎",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    minRequired: 20,
    description: "Healthy meals and snacks",
  },
  {
    id: "fun",
    name: "Fun",
    emoji: "🎮",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    minRequired: 0,
    description: "Games, toys, entertainment",
  },
  {
    id: "savings",
    name: "Savings",
    emoji: "🐷",
    color: "#EC4899",
    bgColor: "#FDF2F8",
    minRequired: 0,
    description: "For future goals",
  },
  {
    id: "giving",
    name: "Giving",
    emoji: "❤️",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    minRequired: 0,
    description: "Help others & charity",
  },
];

export interface BudgetEvent {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: string;
  cost: number;
  isOptional: boolean;
  positiveOutcome?: string;
  negativeOutcome?: string;
}

export const BUDGET_EVENTS: BudgetEvent[] = [
  {
    id: "birthday",
    title: "Friend's Birthday!",
    emoji: "🎂",
    description: "Your friend is having a party. Buy a gift?",
    category: "giving",
    cost: 10,
    isOptional: true,
    positiveOutcome: "Your friend loved the gift! Great friendship!",
    negativeOutcome: "You couldn't bring a gift. That's okay, you can make a card!",
  },
  {
    id: "school-trip",
    title: "School Trip",
    emoji: "🚌",
    description: "A school trip to the museum costs money.",
    category: "fun",
    cost: 15,
    isOptional: false,
    positiveOutcome: "Amazing trip! You learned so much!",
    negativeOutcome: "You had to miss the trip. Maybe next time!",
  },
  {
    id: "hungry-day",
    title: "Extra Hungry Day",
    emoji: "🍕",
    description: "You need an extra snack today!",
    category: "food",
    cost: 5,
    isOptional: false,
    positiveOutcome: "Yummy snack! Energy restored!",
    negativeOutcome: "Tummy was grumbling all day...",
  },
  {
    id: "new-game",
    title: "New Game Released!",
    emoji: "🎮",
    description: "Your favorite game series has a new release!",
    category: "fun",
    cost: 20,
    isOptional: true,
    positiveOutcome: "So much fun! Best game ever!",
    negativeOutcome: "You'll save up for it later!",
  },
  {
    id: "charity",
    title: "Charity Collection",
    emoji: "🏥",
    description: "School is collecting for the children's hospital.",
    category: "giving",
    cost: 5,
    isOptional: true,
    positiveOutcome: "You helped sick children! Hero!",
    negativeOutcome: "You can help in other ways!",
  },
  {
    id: "book-fair",
    title: "Book Fair",
    emoji: "📚",
    description: "Amazing books at the school book fair!",
    category: "fun",
    cost: 8,
    isOptional: true,
    positiveOutcome: "New books to read! Knowledge grows!",
    negativeOutcome: "You can borrow from the library!",
  },
  {
    id: "surprise-expense",
    title: "Broken Pencil Case",
    emoji: "✏️",
    description: "Your pencil case broke! Need a new one.",
    category: "food",
    cost: 6,
    isOptional: false,
    positiveOutcome: "New pencil case! Ready for school!",
    negativeOutcome: "Using a plastic bag for now...",
  },
  {
    id: "ice-cream",
    title: "Ice Cream Truck!",
    emoji: "🍦",
    description: "The ice cream truck is here! Everyone is getting some!",
    category: "fun",
    cost: 3,
    isOptional: true,
    positiveOutcome: "Delicious! Best day ever!",
    negativeOutcome: "Maybe next time!",
  },
  {
    id: "pet-food",
    title: "Pet Needs Food",
    emoji: "🐕",
    description: "Your pet's food ran out!",
    category: "food",
    cost: 12,
    isOptional: false,
    positiveOutcome: "Happy pet! Wagging tail!",
    negativeOutcome: "Had to ask parents for help...",
  },
  {
    id: "savings-goal",
    title: "Savings Check",
    emoji: "🎯",
    description: "Did you save anything this week?",
    category: "savings",
    cost: 0,
    isOptional: true,
    positiveOutcome: "Great job saving! Future you says thanks!",
    negativeOutcome: "Try to save a little next time!",
  },
];

export interface BudgetGameState {
  weeklyBudget: number;
  allocations: Record<string, number>;
  currentEvent: number;
  events: BudgetEvent[];
  results: { event: BudgetEvent; success: boolean; spent: number }[];
  phase: "allocate" | "events" | "complete";
}

export function initializeBudgetGame(difficulty: number): BudgetGameState {
  const weeklyBudget = 50 + difficulty * 10;
  
  const numEvents = difficulty <= 3 ? 3 : difficulty <= 6 ? 4 : 5;
  const shuffled = [...BUDGET_EVENTS].sort(() => Math.random() - 0.5);
  const events = shuffled.slice(0, numEvents);
  
  const initialAllocations: Record<string, number> = {};
  BUDGET_CATEGORIES.forEach((cat) => {
    initialAllocations[cat.id] = 0;
  });
  
  return {
    weeklyBudget,
    allocations: initialAllocations,
    currentEvent: 0,
    events,
    results: [],
    phase: "allocate",
  };
}

export function checkEventAffordable(
  allocations: Record<string, number>,
  event: BudgetEvent
): boolean {
  return allocations[event.category] >= event.cost;
}
