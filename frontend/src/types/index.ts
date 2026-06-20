export type BudgetTier = 'Low' | 'Medium' | 'High';

export interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface ItineraryDay {
  _id?: string;
  dayNumber: number;
  activities: Activity[];
}

export interface PackingItem {
  _id?: string;
  item: string;
  category: string;
  isPacked: boolean;
}

export interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: {
    _id?: string;
    name: string;
    tier: string;
    estimatedCostNightUSD: number;
    rating: string;
  }[];
  packingList: PackingItem[];
  estimatedBudget: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    total: number;
  };
  travelMonth?: string;
  status: string;
}