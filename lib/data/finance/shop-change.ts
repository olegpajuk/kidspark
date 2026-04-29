export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  basePrice: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "apple", name: "Apple", emoji: "🍎", basePrice: 0.30 },
  { id: "banana", name: "Banana", emoji: "🍌", basePrice: 0.25 },
  { id: "bread", name: "Bread", emoji: "🍞", basePrice: 1.20 },
  { id: "milk", name: "Milk", emoji: "🥛", basePrice: 1.50 },
  { id: "juice", name: "Juice", emoji: "🧃", basePrice: 0.85 },
  { id: "candy", name: "Candy", emoji: "🍬", basePrice: 0.15 },
  { id: "cookie", name: "Cookie", emoji: "🍪", basePrice: 0.45 },
  { id: "cake", name: "Cake", emoji: "🍰", basePrice: 3.50 },
  { id: "pizza", name: "Pizza Slice", emoji: "🍕", basePrice: 2.25 },
  { id: "sandwich", name: "Sandwich", emoji: "🥪", basePrice: 2.80 },
  { id: "ice-cream", name: "Ice Cream", emoji: "🍦", basePrice: 1.75 },
  { id: "chocolate", name: "Chocolate", emoji: "🍫", basePrice: 0.95 },
  { id: "donut", name: "Donut", emoji: "🍩", basePrice: 0.80 },
  { id: "coffee", name: "Coffee", emoji: "☕", basePrice: 2.50 },
  { id: "water", name: "Water", emoji: "💧", basePrice: 0.60 },
  { id: "popcorn", name: "Popcorn", emoji: "🍿", basePrice: 1.10 },
  { id: "burger", name: "Burger", emoji: "🍔", basePrice: 4.50 },
  { id: "fries", name: "Fries", emoji: "🍟", basePrice: 1.80 },
  { id: "toy", name: "Small Toy", emoji: "🧸", basePrice: 5.00 },
  { id: "book", name: "Book", emoji: "📖", basePrice: 7.50 },
];

export interface Customer {
  emoji: string;
  name: string;
}

export const CUSTOMERS: Customer[] = [
  { emoji: "👦", name: "Tommy" },
  { emoji: "👧", name: "Sarah" },
  { emoji: "👨", name: "Mr. Smith" },
  { emoji: "👩", name: "Mrs. Jones" },
  { emoji: "🧓", name: "Grandpa Joe" },
  { emoji: "👵", name: "Grandma Rose" },
  { emoji: "👱‍♀️", name: "Emma" },
  { emoji: "👨‍🦱", name: "David" },
  { emoji: "🧑", name: "Alex" },
  { emoji: "👩‍🦰", name: "Lucy" },
];

export interface ShopChangeQuestion {
  id: string;
  items: { item: ShopItem; quantity: number; price: number }[];
  totalPrice: number;
  customerPayment: number;
  changeRequired: number;
  customer: Customer;
  difficulty: number;
}

const PAYMENT_OPTIONS = [1, 2, 5, 10, 20];

export function generateShopChangeQuestion(difficulty: number): ShopChangeQuestion {
  let numItems: number;
  let maxItemPrice: number;
  let roundPrices: boolean;

  switch (difficulty) {
    case 1:
      numItems = 1;
      maxItemPrice = 0.50;
      roundPrices = true;
      break;
    case 2:
      numItems = 1;
      maxItemPrice = 1.00;
      roundPrices = true;
      break;
    case 3:
      numItems = 1;
      maxItemPrice = 2.00;
      roundPrices = false;
      break;
    case 4:
      numItems = 1;
      maxItemPrice = 5.00;
      roundPrices = false;
      break;
    case 5:
      numItems = 2;
      maxItemPrice = 3.00;
      roundPrices = false;
      break;
    case 6:
      numItems = 2;
      maxItemPrice = 5.00;
      roundPrices = false;
      break;
    case 7:
      numItems = 2;
      maxItemPrice = 8.00;
      roundPrices = false;
      break;
    case 8:
      numItems = 3;
      maxItemPrice = 5.00;
      roundPrices = false;
      break;
    case 9:
      numItems = 3;
      maxItemPrice = 8.00;
      roundPrices = false;
      break;
    case 10:
    default:
      numItems = 3;
      maxItemPrice = 10.00;
      roundPrices = false;
      break;
  }

  const eligibleItems = SHOP_ITEMS.filter((item) => item.basePrice <= maxItemPrice);
  const shuffled = [...eligibleItems].sort(() => Math.random() - 0.5);
  const selectedItems = shuffled.slice(0, numItems);

  const items = selectedItems.map((item) => {
    let price = item.basePrice;
    if (roundPrices) {
      price = Math.round(price * 10) / 10;
      if (price < 0.10) price = 0.10;
    }
    const variance = (Math.random() - 0.5) * 0.20;
    price = Math.round((price + variance) * 100) / 100;
    if (price < 0.05) price = 0.05;
    
    const quantity = difficulty >= 7 && Math.random() > 0.7 ? 2 : 1;
    
    return {
      item,
      quantity,
      price: Math.round(price * 100) / 100,
    };
  });

  const totalPrice = Math.round(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
  ) / 100;

  const validPayments = PAYMENT_OPTIONS.filter((p) => p >= totalPrice);
  const customerPayment = validPayments.length > 0 
    ? validPayments[Math.floor(Math.random() * Math.min(2, validPayments.length))]
    : Math.ceil(totalPrice);

  const changeRequired = Math.round((customerPayment - totalPrice) * 100) / 100;

  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

  return {
    id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    items,
    totalPrice,
    customerPayment,
    changeRequired,
    customer,
    difficulty,
  };
}
