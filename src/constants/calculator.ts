import type {
  FoodWasteLevel,
  HouseholdConfig,
  ShoppingPreferences,
} from '../types/calculator';

export const DEFAULT_ZIP_CODE = '48104';

export const DEFAULT_HOUSEHOLD: HouseholdConfig = {
  adults: 1,
  children: 0,
};

export const DEFAULT_SHOPPING_PREFERENCES: ShoppingPreferences = {
  costTier: 'moderate',
  prepStyle: 'mixed',
  storeType: 'standard',
  wasteLevel: 'average',
};

export const DEFAULT_MEALS_OUT_PER_WEEK = 1;

export const COST_FACTORS = {
  costTier: {
    budget: 0.8,
    moderate: 1.0,
    premium: 1.3,
  },
  prepStyle: {
    mostly_home: 0.8,
    mixed: 1.0,
    mostly_prepared: 1.4,
  },
  storeType: {
    discount: 0.85,
    standard: 1.0,
    premium: 1.25,
  },
} as const;

export const RESTAURANT_COST_MULTIPLIER = 3.5;

export const MEALS_PER_DAY = 3;

export const WASTE_PERCENTAGES: Record<FoodWasteLevel, number> = {
  low: 0.05,
  average: 0.2,
  high: 0.35,
};

export const EMAIL_DELAY_RANGE_MS = {
  min: 900,
  max: 2200,
} as const;
