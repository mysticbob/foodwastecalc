// First, let's create interfaces for our data structures
interface SeasonalAdjustment {
  winter: number;
  spring: number;
  summer: number;
  fall: number;
}

interface PriceIndex {
  timestamp: number; // Unix timestamp of last update
  baseValue: number;
  monthlyChange: number;
  yearOverYearChange: number;
}

interface RegionalData {
  costMultiplier: number;
  seasonalFactors: SeasonalAdjustment;
  priceIndices: {
    groceries: PriceIndex;
    restaurant: PriceIndex;
  };
}

// Create a more detailed regional database
export const regionalDatabase: { [key: string]: RegionalData } = {
  '0': {
    costMultiplier: 1.15,
    seasonalFactors: {
      winter: 1.12, // Higher costs due to transportation in winter
      spring: 1.05,
      summer: 0.95, // Lower costs due to local produce
      fall: 1.02
    },
    priceIndices: {
      groceries: {
        timestamp: Date.now(),
        baseValue: 276.589, // Example BLS Food at Home Index
        monthlyChange: 0.3,
        yearOverYearChange: 3.4
      },
      restaurant: {
        timestamp: Date.now(),
        baseValue: 350.647, // Example BLS Food Away from Home Index
        monthlyChange: 0.4,
        yearOverYearChange: 5.1
      }
    }
  },
  // ... similar data for other regions
};

// Helper function to determine season
const getSeason = (date: Date): keyof SeasonalAdjustment => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Function to fetch latest price indices from an API
async function fetchLatestPriceIndices(): Promise<void> {
  try {
    // In a real implementation, this would fetch from BLS API
    // You'll need to sign up for a BLS API key: https://www.bls.gov/developers/
    const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Registration-Key': 'YOUR_BLS_API_KEY'
      },
      body: JSON.stringify({
        seriesid: ['CUSR0000SAF11', 'CUSR0000SEFV'], // Food at home and Food away from home indices
        startyear: new Date().getFullYear() - 1,
        endyear: new Date().getFullYear()
      })
    });

    const data = await response.json();
    // Update the regionalDatabase with new data
    // Implementation would parse the BLS response and update accordingly
  } catch (error) {
    console.error('Failed to fetch latest price indices:', error);
  }
}

// USDA Food Plans cost ranges (updated quarterly)
interface USDAFoodPlanCosts {
  thrifty: number;
  lowCost: number;
  moderate: number;
  liberal: number;
}

const USDAFoodPlans: { [key: string]: USDAFoodPlanCosts } = {
  individual: {
    thrifty: 242.90,
    lowCost: 313.50,
    moderate: 384.40,
    liberal: 472.60
  },
  family: {
    thrifty: 894.80,
    lowCost: 1157.90,
    moderate: 1436.40,
    liberal: 1766.20
  }
};

export interface CostAdjustmentResult {
  baseMultiplier: number;
  seasonalMultiplier: number;
  inflationAdjustment: number;
  totalMultiplier: number;
  lastUpdated: Date;
  priceIndices: {
    groceries: PriceIndex;
    restaurant: PriceIndex;
  };
  usdaPlanComparison: {
    planName: keyof USDAFoodPlanCosts;
    monthlyCost: number;
    percentDifference: number;
  };
}

export const calculateCostAdjustment = async (
  zipCode: string,
  monthlyBudget: number
): Promise<CostAdjustmentResult> => {
  const region = zipCode.charAt(0);
  const regionalData = regionalDatabase[region];
  const currentDate = new Date();
  const currentSeason = getSeason(currentDate);

  // Check if we need to update price indices (older than 24 hours)
  const needsUpdate = Date.now() - regionalData.priceIndices.groceries.timestamp > 24 * 60 * 60 * 1000;
  if (needsUpdate) {
    await fetchLatestPriceIndices();
  }

  // Calculate inflation adjustment
  const inflationAdjustment = 1 + (regionalData.priceIndices.groceries.yearOverYearChange / 100);

  // Calculate total multiplier
  const totalMultiplier = 
    regionalData.costMultiplier * 
    regionalData.seasonalFactors[currentSeason] * 
    inflationAdjustment;

  // Find appropriate USDA food plan
  let closestPlan: keyof USDAFoodPlanCosts = 'moderate';
  let smallestDiff = Infinity;
  
  Object.entries(USDAFoodPlans.individual).forEach(([plan, cost]) => {
    const diff = Math.abs(monthlyBudget - cost);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestPlan = plan as keyof USDAFoodPlanCosts;
    }
  });

  return {
    baseMultiplier: regionalData.costMultiplier,
    seasonalMultiplier: regionalData.seasonalFactors[currentSeason],
    inflationAdjustment,
    totalMultiplier,
    lastUpdated: new Date(regionalData.priceIndices.groceries.timestamp),
    priceIndices: regionalData.priceIndices,
    usdaPlanComparison: {
      planName: closestPlan,
      monthlyCost: USDAFoodPlans.individual[closestPlan],
      percentDifference: ((monthlyBudget - USDAFoodPlans.individual[closestPlan]) / 
        USDAFoodPlans.individual[closestPlan]) * 100
    }
  };
}; 