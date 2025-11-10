export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export type Gender = 'male' | 'female';

export type UnitSystem = 'imperial' | 'metric';

export type CostTier = 'budget' | 'moderate' | 'premium';

export type PrepStyle = 'mostly_home' | 'mixed' | 'mostly_prepared';

export type StoreType = 'discount' | 'standard' | 'premium';

export type FoodWasteLevel = 'low' | 'average' | 'high';

export interface ShoppingPreferences {
  costTier: CostTier;
  prepStyle: PrepStyle;
  storeType: StoreType;
  wasteLevel: FoodWasteLevel;
}

export interface HouseholdConfig {
  adults: number;
  children: number;
}

export interface PersonDefaults {
  age: number;
  gender: Gender;
  imperialHeight: string;  // Stored as 5'10" format
  imperialWeight: number;  // in lbs
  metricHeight: number;    // in cm
  metricWeight: number;    // in kg
  activityLevel: ActivityLevel;
}

export interface Person extends PersonDefaults {
  id: string;
  label: string;
}

export interface PersonBreakdown {
  label: string;
  calories: number;
  dailyCost: number;
}

export interface HouseholdResults {
  totalCalories: number;
  totalDailyCost: number;
  totalMonthlyCost: number;
  wastedCalories: number;
  wastedCost: number;
  breakdown: PersonBreakdown[];
}

export interface CostEstimate {
  daily: number;
  monthly: number;
  seasonal: string;
  regional: string;
  regionalMultiplier: number;
  totalMultiplier: number;
  mealsOutCost: number;
  mealsInCost: number;
}
