export type ItemCategory = "want" | "need";

export interface WantsNeedsItem {
  id: string;
  name: string;
  emoji: string;
  category: ItemCategory;
  difficulty: number;
}

export const WANTS_NEEDS_ITEMS: WantsNeedsItem[] = [
  // Needs - Basic essentials (difficulty 1-3)
  { id: "water", name: "Water", emoji: "💧", category: "need", difficulty: 1 },
  { id: "bread", name: "Bread", emoji: "🍞", category: "need", difficulty: 1 },
  { id: "apple", name: "Apple", emoji: "🍎", category: "need", difficulty: 1 },
  { id: "house", name: "House", emoji: "🏠", category: "need", difficulty: 1 },
  { id: "coat", name: "Warm Coat", emoji: "🧥", category: "need", difficulty: 2 },
  { id: "shoes", name: "Shoes", emoji: "👟", category: "need", difficulty: 2 },
  { id: "medicine", name: "Medicine", emoji: "💊", category: "need", difficulty: 2 },
  { id: "vegetables", name: "Vegetables", emoji: "🥕", category: "need", difficulty: 2 },
  { id: "milk", name: "Milk", emoji: "🥛", category: "need", difficulty: 3 },
  { id: "toothbrush", name: "Toothbrush", emoji: "🪥", category: "need", difficulty: 3 },
  { id: "soap", name: "Soap", emoji: "🧼", category: "need", difficulty: 3 },
  { id: "bed", name: "Bed", emoji: "🛏️", category: "need", difficulty: 3 },
  { id: "school-books", name: "School Books", emoji: "📚", category: "need", difficulty: 4 },
  { id: "glasses", name: "Glasses", emoji: "👓", category: "need", difficulty: 4 },
  { id: "lunch", name: "Lunch", emoji: "🥪", category: "need", difficulty: 4 },
  { id: "pencil", name: "Pencil", emoji: "✏️", category: "need", difficulty: 5 },
  
  // Wants - Nice to have (difficulty 1-3)
  { id: "candy", name: "Candy", emoji: "🍬", category: "want", difficulty: 1 },
  { id: "toy-car", name: "Toy Car", emoji: "🚗", category: "want", difficulty: 1 },
  { id: "ice-cream", name: "Ice Cream", emoji: "🍦", category: "want", difficulty: 1 },
  { id: "teddy-bear", name: "Teddy Bear", emoji: "🧸", category: "want", difficulty: 1 },
  { id: "video-game", name: "Video Game", emoji: "🎮", category: "want", difficulty: 2 },
  { id: "tablet", name: "Tablet", emoji: "📱", category: "want", difficulty: 2 },
  { id: "bicycle", name: "Bicycle", emoji: "🚲", category: "want", difficulty: 2 },
  { id: "skateboard", name: "Skateboard", emoji: "🛹", category: "want", difficulty: 2 },
  { id: "headphones", name: "Headphones", emoji: "🎧", category: "want", difficulty: 3 },
  { id: "toy-robot", name: "Robot Toy", emoji: "🤖", category: "want", difficulty: 3 },
  { id: "football", name: "Football", emoji: "⚽", category: "want", difficulty: 3 },
  { id: "lego", name: "Lego Set", emoji: "🧱", category: "want", difficulty: 3 },
  { id: "chocolate", name: "Chocolate", emoji: "🍫", category: "want", difficulty: 4 },
  { id: "movie-ticket", name: "Movie Ticket", emoji: "🎬", category: "want", difficulty: 4 },
  { id: "pizza", name: "Pizza Party", emoji: "🍕", category: "want", difficulty: 4 },
  { id: "stickers", name: "Stickers", emoji: "⭐", category: "want", difficulty: 5 },
  
  // Trickier items (higher difficulty)
  { id: "school-bag", name: "School Bag", emoji: "🎒", category: "need", difficulty: 5 },
  { id: "healthy-food", name: "Healthy Food", emoji: "🥗", category: "need", difficulty: 5 },
  { id: "winter-boots", name: "Winter Boots", emoji: "🥾", category: "need", difficulty: 6 },
  { id: "sunscreen", name: "Sunscreen", emoji: "🧴", category: "need", difficulty: 6 },
  { id: "raincoat", name: "Raincoat", emoji: "🧥", category: "need", difficulty: 6 },
  
  { id: "fancy-dress", name: "Fancy Dress", emoji: "👗", category: "want", difficulty: 5 },
  { id: "watch", name: "Smart Watch", emoji: "⌚", category: "want", difficulty: 5 },
  { id: "new-phone", name: "New Phone", emoji: "📱", category: "want", difficulty: 6 },
  { id: "designer-shoes", name: "Designer Shoes", emoji: "👠", category: "want", difficulty: 6 },
  { id: "gaming-console", name: "Gaming Console", emoji: "🕹️", category: "want", difficulty: 6 },
  
  // Context-dependent (higher difficulty - requires thinking)
  { id: "birthday-cake", name: "Birthday Cake", emoji: "🎂", category: "want", difficulty: 7 },
  { id: "holiday-trip", name: "Holiday Trip", emoji: "✈️", category: "want", difficulty: 7 },
  { id: "swimming-lessons", name: "Swimming Lessons", emoji: "🏊", category: "need", difficulty: 7 },
  { id: "warm-blanket", name: "Warm Blanket", emoji: "🛋️", category: "need", difficulty: 7 },
  { id: "first-aid-kit", name: "First Aid Kit", emoji: "🩹", category: "need", difficulty: 8 },
  { id: "fresh-fruit", name: "Fresh Fruit", emoji: "🍇", category: "need", difficulty: 8 },
  { id: "extra-snacks", name: "Extra Snacks", emoji: "🍿", category: "want", difficulty: 8 },
  { id: "second-dessert", name: "Second Dessert", emoji: "🧁", category: "want", difficulty: 8 },
];

export interface WantsNeedsQuestion {
  id: string;
  items: WantsNeedsItem[];
  difficulty: number;
}

export function generateWantsNeedsQuestion(difficulty: number): WantsNeedsQuestion {
  const maxDifficulty = Math.min(difficulty + 2, 10);
  const minDifficulty = Math.max(1, difficulty - 1);
  
  const eligibleItems = WANTS_NEEDS_ITEMS.filter(
    (item) => item.difficulty >= minDifficulty && item.difficulty <= maxDifficulty
  );
  
  const needs = eligibleItems.filter((item) => item.category === "need");
  const wants = eligibleItems.filter((item) => item.category === "want");
  
  const itemsPerCategory = difficulty <= 3 ? 2 : difficulty <= 6 ? 3 : 4;
  
  const shuffledNeeds = [...needs].sort(() => Math.random() - 0.5);
  const shuffledWants = [...wants].sort(() => Math.random() - 0.5);
  
  const selectedNeeds = shuffledNeeds.slice(0, itemsPerCategory);
  const selectedWants = shuffledWants.slice(0, itemsPerCategory);
  
  const allItems = [...selectedNeeds, ...selectedWants].sort(() => Math.random() - 0.5);
  
  return {
    id: `wn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    items: allItems,
    difficulty,
  };
}
