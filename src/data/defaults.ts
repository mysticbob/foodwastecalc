// Move the defaults data here
export interface PersonDefaults {
  age: number;
  gender: 'male' | 'female';
  imperialHeight: string;
  imperialWeight: number;
  metricHeight: number;
  metricWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}

export const DEFAULT_PROFILES: Record<string, PersonDefaults> = {
  'adult-male': {
    age: 53,
    gender: 'male',
    imperialHeight: "5'10\"",
    imperialWeight: 170,
    metricHeight: 178,
    metricWeight: 77,
    activityLevel: 'active'
  },
  'adult-female': {
    age: 45,
    gender: 'female',
    imperialHeight: "5'5\"",
    imperialWeight: 140,
    metricHeight: 165,
    metricWeight: 63.5,
    activityLevel: 'moderate'
  },
  'kid-7y-male': {
    age: 7,
    gender: 'male',
    imperialHeight: "4'0\"",
    imperialWeight: 50,
    metricHeight: 122,
    metricWeight: 22.7,
    activityLevel: 'veryActive'
  },
  'kid-10y-female': {
    age: 10,
    gender: 'female',
    imperialHeight: "4'6\"",
    imperialWeight: 70,
    metricHeight: 137,
    metricWeight: 31.8,
    activityLevel: 'veryActive'
  },
  'teen-13y-male': {
    age: 13,
    gender: 'male',
    imperialHeight: "5'2\"",
    imperialWeight: 100,
    metricHeight: 157,
    metricWeight: 45.4,
    activityLevel: 'veryActive'
  },
  'teen-16y-female': {
    age: 16,
    gender: 'female',
    imperialHeight: "5'4\"",
    imperialWeight: 120,
    metricHeight: 162,
    metricWeight: 54.4,
    activityLevel: 'active'
  }
}; 