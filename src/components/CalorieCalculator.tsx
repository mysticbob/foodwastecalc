import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  useToast,
  Switch,
  Input,
  FormHelperText,
  Divider,
  Icon,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  UnorderedList,
  ListItem,
  RadioGroup,
  Radio,
  Tooltip,
  SimpleGrid,
  Collapse,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
  Link,
  FormErrorMessage,
} from '@chakra-ui/react';
import { calculateCostAdjustment, type CostAdjustmentResult } from '../utils/costAdjustment';
import { RepeatIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { DEFAULT_PROFILES, type PersonDefaults } from '../data/defaults';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Gender = 'male' | 'female';
type UnitSystem = 'imperial' | 'metric';

// Types for shopping preferences
type CostTier = 'budget' | 'moderate' | 'premium';
type PrepStyle = 'mostly_home' | 'mixed' | 'mostly_prepared';
type StoreType = 'discount' | 'standard' | 'premium';
type FoodWasteLevel = 'low' | 'average' | 'high';

interface ActivityMultipliers {
  [key: string]: number;
}

interface CostEstimate {
  daily: number;
  monthly: number;
  seasonal: string;
  regional: string;
  regionalMultiplier: number;
  totalMultiplier: number;
  mealsOutCost: number;
  mealsInCost: number;
}

interface ShoppingPreferences {
  costTier: CostTier;
  prepStyle: PrepStyle;
  storeType: StoreType;
  wasteLevel: FoodWasteLevel;
}

interface HouseholdConfig {
  adults: number;
  children: number;
}

interface Person extends PersonDefaults {
  id: string;
  label: string;
}

const DEFAULT_VALUES = {
  age: '53',
  gender: 'male' as Gender,
  weight: '170',
  height: '70',
  heightDisplay: "5'10\"",
  activityLevel: 'active' as ActivityLevel,
  unitSystem: 'imperial' as UnitSystem,
  zipCode: '48104'
};

// State-level default multipliers (using first 2 digits of ZIP)
const STATE_COST_MULTIPLIERS: { [key: string]: number } = {
  // Northeast
  '00': 1.15,  // Default Northeast premium
  '10': 1.15,  // NY state baseline
  '11': 1.15,  // NY state baseline
  '12': 1.05,  // Upstate NY (lower than state baseline)
  '13': 1.05,  // Upstate NY
  '14': 1.05,  // Upstate NY
  '06': 1.20,  // CT
  '02': 1.20,  // MA
  '03': 1.10,  // NH
  '04': 1.10,  // ME
  '05': 1.10,  // VT
  '01': 1.15,  // PA
  '19': 1.15,  // PA
  '07': 1.20,  // NJ
  '08': 1.20,  // NJ

  // Midwest
  '48': 1.00,  // MI baseline
  '49': 1.00,  // MI baseline
  '53': 0.95,  // WI
  '54': 0.95,  // WI
  '55': 0.95,  // WI
  '60': 1.05,  // IL baseline
  '61': 1.00,  // IL downstate
  '62': 1.00,  // IL downstate
  '50': 0.85,  // MN
  '51': 0.85,  // SD
  '52': 0.85,  // ND
  '56': 0.90,  // IA
  '57': 0.90,  // IA
  '43': 0.95,  // OH
  '44': 0.95,  // OH
  '45': 0.95,  // OH
  '46': 0.95,  // IN
  '47': 0.95,  // IN

  // West Coast
  '90': 1.25,  // CA baseline
  '91': 1.25,  // CA baseline
  '92': 1.25,  // CA baseline
  '93': 1.20,  // CA central
  '94': 1.25,  // CA baseline
  '95': 1.25,  // CA baseline
  '96': 1.20,  // CA north
  '97': 1.15,  // OR
  '98': 1.20,  // WA
  '99': 1.15,  // WA eastern

  // South
  '30': 1.00,  // GA
  '31': 0.95,  // GA south
  '32': 1.05,  // FL
  '33': 1.05,  // FL
  '34': 1.05,  // FL
  '35': 0.90,  // AL
  '36': 0.90,  // AL
  '37': 0.95,  // NC
  '38': 0.90,  // MS
  '39': 0.90,  // MS
  '27': 0.95,  // TN
  '28': 0.95,  // TN
};

// Specific metro/city adjustments (using first 3 digits when significantly different from state)
const METRO_COST_MULTIPLIERS: { [key: string]: number } = {
  // NYC Metro (significantly higher than NY state)
  '100': 1.45,  // Manhattan
  '101': 1.45,  // Manhattan
  '102': 1.45,  // Manhattan
  '112': 1.35,  // Brooklyn
  '104': 1.35,  // Bronx
  '110': 1.30,  // Queens
  
  // Other major metros
  '481': 1.05,  // Ann Arbor (higher than MI baseline)
  '482': 1.08,  // Detroit metro
  '606': 1.25,  // Chicago (higher than IL baseline)
  '945': 1.50,  // San Francisco
  '946': 1.50,  // San Francisco Bay Area
  '900': 1.35,  // Los Angeles
  '901': 1.35,  // Los Angeles
  '980': 1.35,  // Seattle
  '021': 1.35,  // Boston
  '022': 1.35,  // Boston metro
  '190': 1.25,  // Philadelphia
  '191': 1.25,  // Philadelphia
  '076': 1.30,  // Newark
  '335': 1.20,  // Miami
  '336': 1.20,  // Miami metro
  '300': 1.15,  // Atlanta
  '770': 1.20,  // DC metro
  '780': 1.20,  // DC metro
  
  // College towns (often higher than state baseline)
  '479': 1.02,  // Bloomington, IN
  '618': 1.05,  // Champaign-Urbana, IL
  '489': 1.03,  // East Lansing, MI
  '537': 1.00,  // Madison, WI
  '430': 1.00,  // Columbus, OH
};

// Helper function to get regional multiplier
const getRegionalMultiplier = (zipCode: string): number => {
  // Try specific metro area first (3 digits)
  const firstThree = zipCode.substring(0, 3);
  if (METRO_COST_MULTIPLIERS[firstThree]) {
    return METRO_COST_MULTIPLIERS[firstThree];
  }

  // Fall back to state level (2 digits)
  const firstTwo = zipCode.substring(0, 2);
  return STATE_COST_MULTIPLIERS[firstTwo] || 1.0;
};

// Enhanced region name function
const getRegionName = (zipCode: string): string => {
  const firstThree = zipCode.substring(0, 3);
  const firstTwo = zipCode.substring(0, 2);

  // Metro areas
  const metroNames: { [key: string]: string } = {
    '100': 'Manhattan',
    '101': 'Manhattan',
    '102': 'Manhattan',
    '112': 'Brooklyn',
    '104': 'Bronx',
    '110': 'Queens',
    '481': 'Ann Arbor',
    '482': 'Detroit Metro',
    '606': 'Chicago',
    '945': 'San Francisco',
    '946': 'San Francisco Bay Area',
    '900': 'Los Angeles',
    '980': 'Seattle',
    '021': 'Boston',
    '190': 'Philadelphia',
    '335': 'Miami',
    '300': 'Atlanta',
    // ... add other metro names
  };

  // State names
  const stateNames: { [key: string]: string } = {
    '48': 'Michigan',
    '10': 'New York',
    '11': 'New York',
    '90': 'California',
    '60': 'Illinois',
    // ... add other state names
  };

  return metroNames[firstThree] || 
         `${stateNames[firstTwo] || 'United States'}${METRO_COST_MULTIPLIERS[firstThree] ? ' Metro Area' : ''}`;
};

const CalorieCalculator: React.FC = () => {
  const [age, setAge] = useState<string>(DEFAULT_VALUES.age);
  const [gender, setGender] = useState<Gender>(DEFAULT_VALUES.gender);
  const [weight, setWeight] = useState<string>(DEFAULT_VALUES.weight);
  const [height, setHeight] = useState<string>(DEFAULT_VALUES.height);
  const [heightDisplay, setHeightDisplay] = useState<string>(DEFAULT_VALUES.heightDisplay);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(DEFAULT_VALUES.activityLevel);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULT_VALUES.unitSystem);
  const [result, setResult] = useState<number | null>(null);
  const [costFactors, setCostFactors] = useState<Partial<CostFactors>>({
    zipCode: DEFAULT_VALUES.zipCode
  });
  const toast = useToast();
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [shoppingPrefs, setShoppingPrefs] = useState<ShoppingPreferences>({
    costTier: 'moderate',
    prepStyle: 'mixed',
    storeType: 'standard',
    wasteLevel: 'average'
  });
  const [zipCode, setZipCode] = useState<string>(DEFAULT_VALUES.zipCode);
  const [mealsOutPerWeek, setMealsOutPerWeek] = useState<number>(1);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [household, setHousehold] = useState<HouseholdConfig>({ adults: 1, children: 0 });
  const [people, setPeople] = useState<Person[]>([]);
  const [isCustomizePeopleOpen, setIsCustomizePeopleOpen] = useState(false);
  const [householdResults, setHouseholdResults] = useState<{
    totalCalories: number;
    totalDailyCost: number;
    totalMonthlyCost: number;
    wastedCalories: number;
    wastedCost: number;
    breakdown: Array<{
      label: string;
      calories: number;
      dailyCost: number;
    }>;
  } | null>(null);
  const [leftoversWasted, setLeftoversWasted] = useState<number>(3);
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [resultsReady, setResultsReady] = useState<boolean>(false);

  // Updated cost calculation factors
  const COST_FACTORS = {
    costTier: {
      budget: 0.8,    // 20% less than moderate
      moderate: 1.0,  // baseline
      premium: 1.3    // 30% more than moderate
    },
    prepStyle: {
      mostly_home: 0.8,    // 20% less than mixed
      mixed: 1.0,          // baseline
      mostly_prepared: 1.4  // 40% more than mixed
    },
    storeType: {
      discount: 0.85,   // 15% less than standard
      standard: 1.0,    // baseline
      premium: 1.25     // 25% more than standard
    }
  };

  // Add useEffect to calculate on mount
  useEffect(() => {
    calculateBMR();
  }, []);

  // Add useEffect to trigger calculation when any input changes
  useEffect(() => {
    // Only calculate if we have all required fields
    if (age && gender && weight && height && activityLevel) {
      calculateBMR();
    }
  }, [age, gender, weight, height, activityLevel, zipCode, shoppingPrefs]);

  // Separate the calculation into its own effect
  useEffect(() => {
    if (result) {
      const costs = calculateCosts(result);
      setCostEstimate(costs);
      console.log('Recalculating costs:', { result, costs, shoppingPrefs });
    }
  }, [result, shoppingPrefs]); // Recalculate when result or preferences change

  // Add this helper function at the top of the component
  const getRandomAge = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Now fix the useEffect that generates default people
  useEffect(() => {
    const defaultPeople: Person[] = [];
    
    // Add adults with simplified labels
    if (household.adults === 1) {
      defaultPeople.push({
        ...DEFAULT_PROFILES['adult-female'],
        id: 'adult-1',
        label: 'Adult 1'  // Removed (Female)
      });
    } else if (household.adults >= 2) {
      defaultPeople.push({
        ...DEFAULT_PROFILES['adult-male'],
        id: 'adult-1',
        label: 'Adult 1'  // Removed (Male)
      });
      defaultPeople.push({
        ...DEFAULT_PROFILES['adult-female'],
        id: 'adult-2',
        label: 'Adult 2'  // Removed (Female)
      });

      // Add additional adults with random ages
      for (let i = 3; i <= household.adults; i++) {
        const randomAge = getRandomAge(20, 50);
        const gender = i % 2 === 0 ? 'female' : 'male';
        const baseProfile = gender === 'female' ? DEFAULT_PROFILES['adult-female'] : DEFAULT_PROFILES['adult-male'];
        
        defaultPeople.push({
          ...baseProfile,
          age: randomAge,
          id: `adult-${i}`,
          label: `Adult ${i}`  // Removed gender and age
        });
      }
    }

    // Add children based on count with simplified labels
    if (household.children >= 1) {
      defaultPeople.push({
        ...DEFAULT_PROFILES['kid-7y-male'],
        id: 'child-1',
        label: 'Child 1'  // Removed (Age 7)
      });
    }
    if (household.children >= 2) {
      defaultPeople.push({
        ...DEFAULT_PROFILES['kid-10y-female'],
        id: 'child-2',
        label: 'Child 2'  // Removed (Age 10)
      });
    }
    if (household.children >= 3) {
      defaultPeople.push({
        ...DEFAULT_PROFILES['teen-13y-male'],
        id: 'child-3',
        label: 'Child 3'  // Removed (Age 13)
      });
    }

    // Add additional children with simplified labels
    for (let i = 4; i <= household.children; i++) {
      const randomAge = getRandomAge(1, 18);
      const gender = i % 2 === 0 ? 'female' : 'male';
      
      // Choose appropriate base profile based on age range
      let baseProfile;
      if (randomAge <= 5) {
        baseProfile = gender === 'male' ? 'kid-7y-male' : 'kid-7y-female';
      } else if (randomAge <= 12) {
        baseProfile = gender === 'male' ? 'kid-10y-male' : 'kid-10y-female';
      } else {
        baseProfile = gender === 'male' ? 'teen-13y-male' : 'teen-13y-female';
      }
      
      // Create appropriate height/weight adjustments as before...
      // ... [other code for adjustment calculations] ...
      
      defaultPeople.push({
        ...DEFAULT_PROFILES[baseProfile],
        age: randomAge,
        id: `child-${i}`,
        label: `Child ${i}`  // Removed gender and age
      });
    }

    setPeople(defaultPeople);
  }, [household]);

  // Add useEffect to update leftoversWasted when household changes
  useEffect(() => {
    // Calculate 3 leftovers per person in the household
    const totalPeople = household.adults + household.children;
    const defaultLeftovers = totalPeople * 3;
    setLeftoversWasted(defaultLeftovers);
  }, [household.adults, household.children]);

  const calculateBMR = (): void => {
    if (!age || !gender || !weight || !height || !activityLevel) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let weightInKg = Number(weight);
    let heightInCm = Number(height);

    if (unitSystem === 'imperial') {
      weightInKg = Number(weight) * 0.453592;
      heightInCm = Number(height) * 2.54;
    }

    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * Number(age) + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * Number(age) - 161;
    }

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const totalCalories = Math.round(bmr * activityMultipliers[activityLevel]);
    setResult(totalCalories);
    
    // Calculate costs immediately after setting calories
    const costs = calculateCosts(totalCalories);
    setCostEstimate(costs);
  };

  const resetToDefaults = () => {
    setAge(DEFAULT_VALUES.age);
    setGender(DEFAULT_VALUES.gender);
    setWeight(DEFAULT_VALUES.weight);
    setHeight(DEFAULT_VALUES.height);
    setHeightDisplay(DEFAULT_VALUES.heightDisplay);
    setActivityLevel(DEFAULT_VALUES.activityLevel);
    setUnitSystem(DEFAULT_VALUES.unitSystem);
    setCostFactors(prev => ({
      ...prev,
      zipCode: DEFAULT_VALUES.zipCode
    }));
    
    // Calculate after a short delay to ensure state is updated
    setTimeout(calculateBMR, 0);
  };

  const parseHeight = (heightStr: string): number | null => {
    heightStr = heightStr.replace(/\s/g, '');
    
    const feetInchesRegex = /^(\d+)(?:'|ft)(\d+)?(?:"|in)?$/i;
    const feetInchesMatch = heightStr.match(feetInchesRegex);
    
    if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1]);
      const inches = parseInt(feetInchesMatch[2] || '0');
      return feet * 12 + inches;
    }
    
    const decimalFeetRegex = /^(\d+)\.(\d+)$/;
    const decimalFeetMatch = heightStr.match(decimalFeetRegex);
    
    if (decimalFeetMatch) {
      const feet = parseInt(decimalFeetMatch[1]);
      const fraction = parseFloat(`0.${decimalFeetMatch[2]}`);
      return feet * 12 + Math.round(fraction * 12);
    }
    
    const inchesRegex = /^(\d+)(?:"|in)?$/i;
    const inchesMatch = heightStr.match(inchesRegex);
    
    if (inchesMatch) {
      return parseInt(inchesMatch[1]);
    }
    
    return null;
  };

  const handleHeightChange = (value: string) => {
    setHeightDisplay(value);
    
    if (unitSystem === 'metric') {
      setHeight(value);
      return;
    }

    const inches = parseHeight(value);
    if (inches !== null) {
      setHeight(inches.toString());
    }
  };

  const calculateFoodCost = async () => {
    if (!result || !costFactors.dietType || !costFactors.zipCode || !costFactors.zipCodeData?.valid) {
      toast({
        title: "Error",
        description: "Please fill in all required fields with valid values",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Calculate base daily cost
    let dailyCost = result * baseCostPerCalorie[costFactors.dietType];

    // Apply basic multipliers
    if (costFactors.groceryStoreType) {
      dailyCost *= costMultipliers.groceryStoreType[costFactors.groceryStoreType];
    }
    // ... other multipliers ...

    // Get advanced cost adjustments
    const monthlyCost = dailyCost * 30;
    const adjustments = await calculateCostAdjustment(costFactors.zipCode, monthlyCost);

    // Apply final adjustments
    const adjustedDailyCost = dailyCost * adjustments.totalMultiplier;
    const adjustedMonthlyCost = adjustedDailyCost * 30;

    setCostEstimate({
      daily: adjustedDailyCost,
      monthly: adjustedMonthlyCost,
      seasonal: 'winter', // We can make this dynamic later
      regional: `Based on ${costFactors.zipCodeData.metro || 'regional'} prices`,
      regionalMultiplier: adjustments.totalMultiplier,
      totalMultiplier: adjustments.totalMultiplier,
      mealsOutCost: adjustedDailyCost * 0.4 / 3, // Assuming 40% higher cost for meals out, divided by 3 meals per day
      mealsInCost: adjustedDailyCost * 0.6 / 3 // Assuming 60% of cost for meals in, divided by 3 meals per day
    });
  };

  const calculateCosts = (calories: number) => {
    const baseDaily = calories * 0.0025; // Base cost per calorie
    const regionalMultiplier = getRegionalMultiplier(zipCode);
    
    // Calculate meals out cost
    const mealsPerDay = 3; // Assume 3 meals per day
    const mealsPerWeek = mealsPerDay * 7;
    const percentMealsOut = mealsOutPerWeek / mealsPerWeek;
    const percentMealsIn = 1 - percentMealsOut;
    
    // Restaurant meals typically cost 3-4x more than home-prepared
    const restaurantMultiplier = 3.5;
    
    // Calculate weighted average of home vs restaurant costs
    const prefMultiplier = 
      COST_FACTORS.costTier[shoppingPrefs.costTier] *
      COST_FACTORS.prepStyle[shoppingPrefs.prepStyle] *
      COST_FACTORS.storeType[shoppingPrefs.storeType];
      
    const totalMultiplier = 
      (prefMultiplier * percentMealsIn + 
       (prefMultiplier * restaurantMultiplier * percentMealsOut)) *
      regionalMultiplier;

    const dailyCost = baseDaily * totalMultiplier;
    const monthlyCost = dailyCost * 30;

    return {
      daily: dailyCost,
      monthly: monthlyCost,
      seasonal: 'winter',
      regional: getRegionName(zipCode),
      regionalMultiplier,
      totalMultiplier,
      mealsOutCost: (baseDaily * prefMultiplier * restaurantMultiplier * regionalMultiplier) / mealsPerDay,
      mealsInCost: (baseDaily * prefMultiplier * regionalMultiplier) / mealsPerDay
    };
  };

  const handleZipCodeChange = (value: string) => {
    setZipCode(value);
    // You might want to validate the ZIP code here
  };

  const handlePreferenceChange = (
    type: keyof ShoppingPreferences,
    value: string
  ) => {
    const newPrefs = { ...shoppingPrefs, [type]: value };
    setShoppingPrefs(newPrefs);
    // The useEffect will handle recalculating costs
  };

  // Calculate BMR and costs for a single person
  const calculatePersonNeeds = (person: Person) => {
    // Ensure we have valid values to work with (provide fallbacks if not)
    const safeAge = person.age || 30; // Fallback age
    const safeMetricWeight = person.metricWeight || 70; // Fallback weight in kg
    const safeMetricHeight = person.metricHeight || 170; // Fallback height in cm
    const safeImperialWeight = person.imperialWeight || 154; // Fallback weight in pounds
    
    let weightInKg = safeMetricWeight;
    let heightInCm = safeMetricHeight;

    if (unitSystem === 'imperial') {
      weightInKg = safeImperialWeight * 0.453592;
      
      // Add a safety check for undefined imperialHeight
      if (person.imperialHeight && typeof person.imperialHeight === 'string' && person.imperialHeight.includes("'")) {
        try {
          const parts = person.imperialHeight.split("'");
          const feet = Number(parts[0]) || 0;
          const inches = Number(parts[1]?.replace('"', '')) || 0;
          heightInCm = feet * 30.48 + inches * 2.54;
        } catch (e) {
          console.warn("Error parsing height, using metric value", e);
          heightInCm = safeMetricHeight;
        }
      } else {
        heightInCm = safeMetricHeight;
      }
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (person.gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * safeAge + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * safeAge - 161;
    }

    // Apply activity multiplier (with safety check)
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const activityLevel = person.activityLevel || 'moderate'; // Provide fallback
    const multiplier = activityMultipliers[activityLevel] || 1.55; // Fallback to moderate if invalid
    
    const totalCalories = Math.round(bmr * multiplier);
    
    // Calculate costs
    const baseDaily = totalCalories * 0.0025; // Base cost per calorie
    const regionalMultiplier = getRegionalMultiplier(zipCode);
    const prefMultiplier = 
      COST_FACTORS.costTier[shoppingPrefs.costTier] *
      COST_FACTORS.prepStyle[shoppingPrefs.prepStyle] *
      COST_FACTORS.storeType[shoppingPrefs.storeType];
    
    const dailyCost = baseDaily * prefMultiplier * regionalMultiplier;

    return {
      calories: totalCalories,
      dailyCost: dailyCost
    };
  };

  // Add waste percentage mapping
  const WASTE_PERCENTAGES = {
    low: 0.05,      // 5% - hardly any
    average: 0.20,  // 20% - average
    high: 0.35      // 35% - lots
  };

  // Calculate household totals
  useEffect(() => {
    if (people.length > 0) {
      const breakdown = people.map(person => {
        const needs = calculatePersonNeeds(person);
        return {
          label: person.label,
          calories: needs.calories,
          dailyCost: needs.dailyCost
        };
      });

      const totals = breakdown.reduce((acc, person) => ({
        totalCalories: acc.totalCalories + person.calories,
        totalDailyCost: acc.totalDailyCost + person.dailyCost,
      }), { totalCalories: 0, totalDailyCost: 0 });

      // Calculate monthly cost first
      const totalMonthlyCost = totals.totalDailyCost * 30;
      
      // Simplified waste calculation - just take the percentage of the total monthly cost
      const wastePercentage = WASTE_PERCENTAGES[shoppingPrefs.wasteLevel];
      const wastedCost = totalMonthlyCost * wastePercentage;
      
      // Calculate wasted calories based on the same percentage
      const wastedCalories = totals.totalCalories * wastePercentage;

      setHouseholdResults({
        totalCalories: totals.totalCalories,
        totalDailyCost: totals.totalDailyCost,
        totalMonthlyCost: totalMonthlyCost,
        wastedCalories: wastedCalories,
        wastedCost: wastedCost,
        breakdown
      });
    }
  }, [people, unitSystem, zipCode, shoppingPrefs]);

  // Function to handle processing with delay
  const processWithDelay = () => {
    // Show the modal and set loading state
    setIsLoading(true);
    setIsModalOpen(true);
    
    // Generate a random delay between 1-3 seconds
    const delay = Math.floor(Math.random() * 2000) + 1000;
    
    // Recalculate results when email is submitted
    if (people.length > 0) {
      const breakdown = people.map(person => {
        const needs = calculatePersonNeeds(person);
        return {
          label: person.label,
          calories: needs.calories,
          dailyCost: needs.dailyCost
        };
      });
      
      // Force recalculation of household totals
      const totals = breakdown.reduce((acc, person) => ({
        totalCalories: acc.totalCalories + person.calories,
        totalDailyCost: acc.totalDailyCost + person.dailyCost,
      }), { totalCalories: 0, totalDailyCost: 0 });
      
      // Calculate monthly cost first
      const totalMonthlyCost = totals.totalDailyCost * 30;
      
      // Simplified waste calculation - just take the percentage of the total monthly cost
      const wastePercentage = WASTE_PERCENTAGES[shoppingPrefs.wasteLevel];
      const wastedCost = totalMonthlyCost * wastePercentage;
      
      // Calculate wasted calories based on the same percentage
      const wastedCalories = totals.totalCalories * wastePercentage;
      
      // Update results immediately
      setHouseholdResults({
        totalCalories: totals.totalCalories,
        totalDailyCost: totals.totalDailyCost,
        totalMonthlyCost: totalMonthlyCost,
        wastedCalories: wastedCalories,
        wastedCost: wastedCost,
        breakdown
      });
    }
    
    // Set a timeout to close the modal and show results
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(false);
      setResultsReady(true);
      
      toast({
        title: "Results ready",
        description: "Your food waste calculator results are ready and have been emailed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, delay);
    
    // Log the email for now
    console.log('Email submitted:', email);
  };

  // Add email validation function
  const validateEmail = (email: string): boolean => {
    // Reset error message
    setEmailError('');
    
    // Check if email is empty
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    // More rigorous validation
    const stricterEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!stricterEmailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    // Check for common disposable email domains (optional, can be expanded)
    const disposableDomains = ['tempmail.com', 'throwawaymail.com', 'mailinator.com', 'tempinbox.com', 'yopmail.com'];
    const emailDomain = email.split('@')[1];
    if (disposableDomains.includes(emailDomain)) {
      setEmailError('Please use a non-temporary email address');
      return false;
    }
    
    return true;
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      {/* Modal for "Cooking..." message */}
      <Modal isOpen={isModalOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={6} textAlign="center">
            <VStack spacing={4}>
              <Spinner size="xl" color="ovie.500" thickness="4px" speed="0.75s" />
              <Text fontSize="xl" fontWeight="bold">Cooking...</Text>
              <Text>Preparing your personalized food waste results</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <VStack spacing={6} align="stretch">
        {/* Logo and Title (if any) */}
        
        {/* 1. Household Configuration - Updated with header and simplified controls */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4} color="ovie.700">
            Household
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel>Adults</FormLabel>
              <NumberInput
                min={1}
                max={4}
                value={household.adults}
                onChange={(_, valueAsNumber) => 
                  setHousehold(prev => ({ ...prev, adults: valueAsNumber || 1 }))
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Children</FormLabel>
              <NumberInput
                min={0}
                max={6}
                value={household.children}
                onChange={(_, valueAsNumber) => 
                  setHousehold(prev => ({ ...prev, children: valueAsNumber || 0 }))
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Zip</FormLabel>
              <Input
                type="text"
                value={zipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="Enter ZIP code"
                maxLength={5}
                pattern="[0-9]*"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Email subscription box - moved here from results section */}
        <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.400">
          <Text fontSize="md" mb={2}>
            Please enter your email to receive your results and a coupon for 20% off your first order.
          </Text>
          <FormControl isInvalid={!!emailError}>
            <Flex>
              <Input 
                placeholder="Your email address" 
                bg="white"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear errors when user starts typing
                  if (emailError) setEmailError('');
                }}
                mr={2}
                isDisabled={isLoading}
                onBlur={() => {
                  // Validate on blur for better user experience
                  if (email) validateEmail(email);
                }}
                _invalid={{
                  borderColor: "red.300",
                  boxShadow: "0 0 0 1px red.300"
                }}
                sx={{
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "black"
                  },
                  "&:-webkit-autofill:focus": {
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    WebkitTextFillColor: "black"
                  }
                }}
              />
              <Button 
                colorScheme="blue"
                onClick={() => {
                  // Validate email before proceeding
                  if (validateEmail(email)) {
                    processWithDelay();
                  }
                }}
                isLoading={isLoading}
                loadingText="Submitting"
                isDisabled={isLoading}
              >
                Submit
              </Button>
            </Flex>
            {emailError && (
              <FormErrorMessage ml={2}>{emailError}</FormErrorMessage>
            )}
          </FormControl>
        </Box>

        {/* Results Section - Only show if email is entered and results are ready */}
        {resultsReady && householdResults && (
          <Box 
            width="full"
            p={6}
            bg="ovie.50"
            borderRadius="md"
            mt={4}
          >
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="ovie.700" mb={4}>
                  Your Household Monthly Meals & Food Costs
                </Text>
                
                <Text fontSize="4xl" fontWeight="bold" color="ovie.700">
                  ${Math.round(householdResults.totalMonthlyCost)} <Text as="span" fontSize="2xl"> / Month</Text>
                </Text>
                
                <Text fontSize="xl" color="ovie.600" mt={2}>
                  Approximately ${Math.round(householdResults.totalDailyCost)} daily to provide {Math.round(householdResults.totalCalories).toLocaleString()} calories
                </Text>
              </Box>
              
              {/* Add the simplified Leftover Waste section */}
              {householdResults.wastedCalories > 0 && (
                <Box 
                  mt={4} 
                  p={5} 
                  bg="red.50" 
                  borderRadius="md" 
                  borderLeft="4px" 
                  borderColor="red.400"
                >
                  <Text fontSize="xl" fontWeight="medium" color="red.700" mb={2}>
                    Food Waste Costs <em>or</em> Possible Savings with <Link href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3" isExternal color="red.700" textDecoration="underline">LightTag</Link>!
                  </Text>
                  
                  <Text fontSize="5xl" fontWeight="bold" color="red.600">
                    ${Math.round(householdResults.wastedCost)} <Text as="span" fontSize="2xl">Food Waste Cost</Text>
                  </Text>
                  
                  {/* Add Ovie Light Tag ROI calculation */}
                  {householdResults.wastedCost > 0 && (
                    <Box mt={4} pt={3} borderTop="1px dashed" borderColor="red.300">
                      {householdResults.wastedCost >= 20 ? (
                        <Text fontSize="md" color="red.600">
                          One Ovie <Link href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3" isExternal color="red.700" textDecoration="underline">Light Tag</Link> ($20) would pay for itself in less than a month!
                        </Text>
                      ) : (
                        <Text fontSize="md" color="red.600">
                          A <Link href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3" isExternal color="red.700" textDecoration="underline">LightTag</Link> would pay for itself in less than {Math.ceil(20 / householdResults.wastedCost)} months.
                        </Text>
                      )}
                      <Text fontSize="md" color="red.600" mt={1}>
                        A pack of 6 <Link href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3" isExternal color="red.700" textDecoration="underline">LightTags</Link> would help you track more leftovers and save even more!
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </VStack>

            {/* Combined Customize Section */}
            <Box mt={4}>
              <Button
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                variant="ghost"
                width="full"
                rightIcon={isCustomizeOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                mb={2}
                color="ovie.600"
                _hover={{ bg: 'ovie.50' }}
              >
                Customize Assumptions
              </Button>
              
              <Collapse in={isCustomizeOpen} animateOpacity>
                <Box 
                  p={4} 
                  bg="gray.50" 
                  borderRadius="md" 
                  border="1px" 
                  borderColor="gray.200"
                >
                  {/* Household Members Section */}
                  <Box mb={6}>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Household Members
                    </Text>
                    {people.map((person, index) => (
                      <Box 
                        key={index}
                        p={4}
                        mb={2}
                        bg="white"
                        borderRadius="md"
                        shadow="sm"
                        width="full"
                      >
                        <Text fontWeight="semibold" mb={3}>{person.label}</Text>

                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Age</FormLabel>
                            <NumberInput
                              min={1}
                              max={120}
                              value={person.age}
                              onChange={(valueString) => {
                                const newPeople = [...people];
                                newPeople[index].age = parseInt(valueString) || 0;
                                setPeople(newPeople);
                              }}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              value={person.gender}
                              onChange={(e) => {
                                const newPeople = [...people];
                                newPeople[index].gender = e.target.value as 'male' | 'female';
                                setPeople(newPeople);
                              }}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Weight (lbs)</FormLabel>
                            <NumberInput
                              min={1}
                              max={500}
                              value={person.imperialWeight}
                              onChange={(valueString) => {
                                const newPeople = [...people];
                                const weight = parseInt(valueString) || 0;
                                newPeople[index].imperialWeight = weight;
                                newPeople[index].metricWeight = Math.round(weight * 0.453592);
                                setPeople(newPeople);
                              }}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Activity Level</FormLabel>
                            <Select
                              value={person.activityLevel}
                              onChange={(e) => {
                                const newPeople = [...people];
                                newPeople[index].activityLevel = e.target.value as ActivityLevel;
                                setPeople(newPeople);
                              }}
                            >
                              <option value="sedentary">Sedentary</option>
                              <option value="light">Light</option>
                              <option value="moderate">Moderate</option>
                              <option value="active">High</option>
                              <option value="veryActive">Extreme</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>

                        {householdResults && householdResults.breakdown[index] && (
                          <Box mt={3}>
                            <Text fontSize="sm">
                              {householdResults.breakdown[index].calories.toLocaleString()} calories/day
                            </Text>
                            <Text fontSize="sm" color="ovie.600">
                              ${householdResults.breakdown[index].dailyCost.toFixed(2)}/day
                            </Text>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {/* Cost Preferences Section */}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Cost Preferences
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Budget Level</FormLabel>
                        <RadioGroup
                          value={shoppingPrefs.costTier}
                          onChange={(value) => handlePreferenceChange('costTier', value)}
                        >
                          <Stack spacing={2}>
                            <Radio value="budget">Budget</Radio>
                            <Radio value="moderate">Moderate</Radio>
                            <Radio value="premium">Premium</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Meal Preparation</FormLabel>
                        <RadioGroup
                          value={shoppingPrefs.prepStyle}
                          onChange={(value) => handlePreferenceChange('prepStyle', value)}
                        >
                          <Stack spacing={2}>
                            <Radio value="mostly_home">Mostly Home-Cooked</Radio>
                            <Radio value="mixed">Mixed</Radio>
                            <Radio value="mostly_prepared">Mostly Prepared</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Shopping Venues</FormLabel>
                        <RadioGroup
                          value={shoppingPrefs.storeType}
                          onChange={(value) => handlePreferenceChange('storeType', value)}
                        >
                          <Stack spacing={2}>
                            <Radio value="discount">Discount</Radio>
                            <Radio value="standard">Standard</Radio>
                            <Radio value="premium">Premium</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>How Much Food Do You Toss?</FormLabel>
                        <RadioGroup
                          value={shoppingPrefs.wasteLevel}
                          onChange={(value) => handlePreferenceChange('wasteLevel', value)}
                        >
                          <Stack spacing={2}>
                            <Radio value="low">Hardly Any (5%)</Radio>
                            <Radio value="average">Average (20%)</Radio>
                            <Radio value="high">Lots (35%)</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default CalorieCalculator;