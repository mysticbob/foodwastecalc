import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_HOUSEHOLD,
  DEFAULT_MEALS_OUT_PER_WEEK,
  DEFAULT_SHOPPING_PREFERENCES,
  DEFAULT_ZIP_CODE,
  MEALS_PER_DAY,
} from '../constants/calculator';
import type {
  HouseholdConfig,
  HouseholdResults,
  Person,
  ShoppingPreferences,
} from '../types/calculator';
import {
  buildHouseholdMembers,
  syncHouseholdMembers,
  updatePersonAtIndex,
} from '../utils/people';
import {
  calculateHouseholdBreakdown,
  pickEmailDelay,
} from '../utils/calculator';
import { validateEmailAddress } from '../utils/validation';

interface RegionalInsights {
  name: string;
  multiplier: number;
  mealsInCost: number;
  mealsOutCost: number;
  totalMultiplier: number;
}

interface UseHouseholdCalculatorReturn {
  household: HouseholdConfig;
  zipCode: string;
  shoppingPreferences: ShoppingPreferences;
  mealsOutPerWeek: number;
  people: Person[];
  email: string;
  emailError: string | null;
  resultsReady: boolean;
  isSubmitting: boolean;
  isCustomizeOpen: boolean;
  householdResults: HouseholdResults | null;
  regionalInsights: RegionalInsights | null;
  setZipCode: (zip: string) => void;
  updateHousehold: (update: Partial<HouseholdConfig>) => void;
  updatePreference: <Key extends keyof ShoppingPreferences>(
    key: Key,
    value: ShoppingPreferences[Key],
  ) => void;
  setMealsOutPerWeek: (value: number) => void;
  updatePerson: (index: number, update: Partial<Person>) => void;
  setEmail: (value: string) => void;
  validateEmail: () => boolean;
  submitEmail: () => Promise<boolean>;
  toggleCustomize: () => void;
}

const clampNumber = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

export const useHouseholdCalculator = (): UseHouseholdCalculatorReturn => {
  const [household, setHousehold] = useState<HouseholdConfig>(DEFAULT_HOUSEHOLD);
  const [zipCode, setZipCodeState] = useState(DEFAULT_ZIP_CODE);
  const [shoppingPreferences, setShoppingPreferences] =
    useState<ShoppingPreferences>(DEFAULT_SHOPPING_PREFERENCES);
  const [mealsOutPerWeek, setMealsOutPerWeekState] = useState(
    DEFAULT_MEALS_OUT_PER_WEEK,
  );
  const [people, setPeople] = useState<Person[]>(() =>
    buildHouseholdMembers(DEFAULT_HOUSEHOLD),
  );
  const [email, setEmailState] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resultsReady, setResultsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    setPeople((current) => syncHouseholdMembers(current, household));
  }, [household]);

  const computation = useMemo(() => {
    if (!people.length) {
      return null;
    }

    return calculateHouseholdBreakdown(
      people,
      shoppingPreferences,
      zipCode,
      mealsOutPerWeek,
    );
  }, [people, shoppingPreferences, zipCode, mealsOutPerWeek]);

  const householdResults = useMemo<HouseholdResults | null>(() => {
    if (!computation) {
      return null;
    }

    return {
      ...computation.totals,
      breakdown: computation.breakdown,
    };
  }, [computation]);

  const regionalInsights = useMemo<RegionalInsights | null>(() => {
    if (!computation) {
      return null;
    }

    return {
      name: computation.regionName,
      multiplier: computation.regionalMultiplier,
      mealsInCost: computation.mealsInCost,
      mealsOutCost: computation.mealsOutCost,
      totalMultiplier: computation.totalMultiplier,
    };
  }, [computation]);

  const setZipCode = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 5);
    setZipCodeState(sanitized);
  }, []);

  const updateHousehold = useCallback((update: Partial<HouseholdConfig>) => {
    setHousehold((prev) => ({
      adults: clampNumber(update.adults ?? prev.adults, 1, 6),
      children: clampNumber(update.children ?? prev.children, 0, 8),
    }));
  }, []);

  const updatePreference = useCallback(
    <Key extends keyof ShoppingPreferences>(
      key: Key,
      value: ShoppingPreferences[Key],
    ) => {
      setShoppingPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const setMealsOutPerWeek = useCallback((value: number) => {
    setMealsOutPerWeekState(() => clampNumber(value, 0, MEALS_PER_DAY * 7));
  }, []);

  const updatePerson = useCallback((index: number, update: Partial<Person>) => {
    setPeople((current) => updatePersonAtIndex(current, index, update));
  }, []);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (emailError) {
      setEmailError(null);
    }
  }, [emailError]);

  const validateEmail = useCallback(() => {
    const result = validateEmailAddress(email);
    setEmailError(result.valid ? null : result.message ?? 'Invalid email');
    return result.valid;
  }, [email]);

  const submitEmail = useCallback(async () => {
    if (!validateEmail()) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const delay = pickEmailDelay();
      await new Promise((resolve) => setTimeout(resolve, delay));
      setResultsReady(true);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateEmail]);

  const toggleCustomize = useCallback(() => {
    setIsCustomizeOpen((prev) => !prev);
  }, []);

  return {
    household,
    zipCode,
    shoppingPreferences,
    mealsOutPerWeek,
    people,
    email,
    emailError,
    resultsReady,
    isSubmitting,
    isCustomizeOpen,
    householdResults,
    regionalInsights,
    setZipCode,
    updateHousehold,
    updatePreference,
    setMealsOutPerWeek,
    updatePerson,
    setEmail,
    validateEmail,
    submitEmail,
    toggleCustomize,
  };
};
