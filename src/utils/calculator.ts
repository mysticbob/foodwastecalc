import {
  COST_FACTORS,
  EMAIL_DELAY_RANGE_MS,
  MEALS_PER_DAY,
  RESTAURANT_COST_MULTIPLIER,
  WASTE_PERCENTAGES,
} from '../constants/calculator';
import type {
  ActivityLevel,
  HouseholdResults,
  Person,
  PersonBreakdown,
  ShoppingPreferences,
} from '../types/calculator';
import { getRegionName, getRegionalMultiplier } from './region';

const BASE_COST_PER_CALORIE = 0.0025;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const calculateDailyCalories = (person: Person): number => {
  const weightKg =
    person.metricWeight ?? person.imperialWeight * 0.453592;
  const heightCm =
    person.metricHeight ??
    (person.imperialHeight ? parseImperialHeight(person.imperialHeight) : 170);
  const bmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * person.age +
    (person.gender === 'male' ? 5 : -161);

  const activityMultiplier =
    ACTIVITY_MULTIPLIERS[person.activityLevel] ?? ACTIVITY_MULTIPLIERS.moderate;

  return Math.round(bmr * activityMultiplier);
};

export const parseImperialHeight = (height: string): number => {
  const trimmed = height.trim();
  const feetInchesMatch = trimmed.match(/^(\d+)'(\d+)"$/);
  if (feetInchesMatch) {
    const feet = Number(feetInchesMatch[1]);
    const inches = Number(feetInchesMatch[2]);
    return feet * 30.48 + inches * 2.54;
  }

  const feetOnlyMatch = trimmed.match(/^(\d+)'$/);
  if (feetOnlyMatch) {
    const feet = Number(feetOnlyMatch[1]);
    return feet * 30.48;
  }

  const inchesMatch = trimmed.match(/^(\d+)"$/);
  if (inchesMatch) {
    const inches = Number(inchesMatch[1]);
    return inches * 2.54;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : 170;
};

const calculatePreferenceMultiplier = ({
  costTier,
  prepStyle,
  storeType,
}: ShoppingPreferences): number => {
  return (
    COST_FACTORS.costTier[costTier] *
    COST_FACTORS.prepStyle[prepStyle] *
    COST_FACTORS.storeType[storeType]
  );
};

export const calculateHouseholdBreakdown = (
  people: Person[],
  preferences: ShoppingPreferences,
  zipCode: string,
  mealsOutPerWeek: number,
): {
  breakdown: PersonBreakdown[];
  totals: Omit<HouseholdResults, 'breakdown'>;
  regionalMultiplier: number;
  regionName: string;
  mealsInCost: number;
  mealsOutCost: number;
  totalMultiplier: number;
} => {
  const prefMultiplier = calculatePreferenceMultiplier(preferences);
  const regionalMultiplier = getRegionalMultiplier(zipCode);
  const regionName = getRegionName(zipCode);

  const mealsPerWeek = MEALS_PER_DAY * 7;
  const percentMealsOut = clamp(mealsOutPerWeek / mealsPerWeek, 0, 1);
  const percentMealsIn = 1 - percentMealsOut;

  const blendedMultiplier =
    prefMultiplier * percentMealsIn +
    prefMultiplier * RESTAURANT_COST_MULTIPLIER * percentMealsOut;

  const totalMultiplier = blendedMultiplier * regionalMultiplier;

  let totalCalories = 0;
  let totalDailyCost = 0;
  let baseDailyCostAggregate = 0;

  const breakdown = people.map<PersonBreakdown>((person) => {
    const calories = calculateDailyCalories(person);
    const baseDailyCost = calories * BASE_COST_PER_CALORIE;
    const dailyCost = baseDailyCost * totalMultiplier;

    totalCalories += calories;
    totalDailyCost += dailyCost;
    baseDailyCostAggregate += baseDailyCost;

    return {
      label: person.label,
      calories,
      dailyCost,
    };
  });

  const totalMonthlyCost = totalDailyCost * 30;
  const wastePercentage = WASTE_PERCENTAGES[preferences.wasteLevel];
  const wastedCost = totalMonthlyCost * wastePercentage;
  const wastedCalories = totalCalories * wastePercentage;

  const mealsInCost =
    (baseDailyCostAggregate * prefMultiplier * regionalMultiplier) / MEALS_PER_DAY;
  const mealsOutCost =
    (baseDailyCostAggregate *
      prefMultiplier *
      RESTAURANT_COST_MULTIPLIER *
      regionalMultiplier) /
    MEALS_PER_DAY;

  return {
    breakdown,
    totals: {
      totalCalories,
      totalDailyCost,
      totalMonthlyCost,
      wastedCalories,
      wastedCost,
    },
    regionalMultiplier,
    regionName,
    mealsInCost,
    mealsOutCost,
    totalMultiplier,
  };
};

export const pickEmailDelay = (): number => {
  const { min, max } = EMAIL_DELAY_RANGE_MS;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
