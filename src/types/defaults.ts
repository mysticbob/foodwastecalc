interface PersonDefaults {
  age: number;
  gender: 'male' | 'female';
  imperialHeight: string;  // Stored as 5'10" format
  imperialWeight: number;  // in lbs
  metricHeight: number;    // in cm
  metricWeight: number;    // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}

export const DEFAULT_PROFILES: Record<string, PersonDefaults> = {
  // Adult Males
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

  // Babies (0-2 years)
  'baby-6m-male': {
    age: 0.5,
    gender: 'male',
    imperialHeight: "2'2\"",
    imperialWeight: 16,
    metricHeight: 66,
    metricWeight: 7.3,
    activityLevel: 'sedentary'
  },
  'baby-6m-female': {
    age: 0.5,
    gender: 'female',
    imperialHeight: "2'1\"",
    imperialWeight: 15,
    metricHeight: 64,
    metricWeight: 6.8,
    activityLevel: 'sedentary'
  },
  'baby-1y-male': {
    age: 1,
    gender: 'male',
    imperialHeight: "2'6\"",
    imperialWeight: 22,
    metricHeight: 76,
    metricWeight: 10,
    activityLevel: 'light'
  },
  'baby-1y-female': {
    age: 1,
    gender: 'female',
    imperialHeight: "2'5\"",
    imperialWeight: 21,
    metricHeight: 74,
    metricWeight: 9.5,
    activityLevel: 'light'
  },

  // Kids (3-12 years)
  'kid-5y-male': {
    age: 5,
    gender: 'male',
    imperialHeight: "3'7\"",
    imperialWeight: 40,
    metricHeight: 109,
    metricWeight: 18,
    activityLevel: 'veryActive'
  },
  'kid-5y-female': {
    age: 5,
    gender: 'female',
    imperialHeight: "3'6\"",
    imperialWeight: 39,
    metricHeight: 107,
    metricWeight: 17.7,
    activityLevel: 'veryActive'
  },
  'kid-10y-male': {
    age: 10,
    gender: 'male',
    imperialHeight: "4'6\"",
    imperialWeight: 70,
    metricHeight: 137,
    metricWeight: 31.8,
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

  // Teens (13-19 years)
  'teen-15y-male': {
    age: 15,
    gender: 'male',
    imperialHeight: "5'7\"",
    imperialWeight: 125,
    metricHeight: 170,
    metricWeight: 56.7,
    activityLevel: 'veryActive'
  },
  'teen-15y-female': {
    age: 15,
    gender: 'female',
    imperialHeight: "5'4\"",
    imperialWeight: 115,
    metricHeight: 162,
    metricWeight: 52.2,
    activityLevel: 'active'
  },
  'teen-17y-male': {
    age: 17,
    gender: 'male',
    imperialHeight: "5'9\"",
    imperialWeight: 142,
    metricHeight: 175,
    metricWeight: 64.4,
    activityLevel: 'veryActive'
  },
  'teen-17y-female': {
    age: 17,
    gender: 'female',
    imperialHeight: "5'4\"",
    imperialWeight: 125,
    metricHeight: 162,
    metricWeight: 56.7,
    activityLevel: 'active'
  },
};

// Group definitions for the simplified interface
export const PROFILE_GROUPS = {
  adults: {
    label: 'Adults',
    profiles: ['adult-male', 'adult-female']
  },
  babies: {
    label: 'Babies (0-2 years)',
    profiles: ['baby-6m-male', 'baby-6m-female', 'baby-1y-male', 'baby-1y-female']
  },
  kids: {
    label: 'Kids (3-12 years)',
    profiles: ['kid-5y-male', 'kid-5y-female', 'kid-10y-male', 'kid-10y-female']
  },
  teens: {
    label: 'Teens (13-19 years)',
    profiles: ['teen-15y-male', 'teen-15y-female', 'teen-17y-male', 'teen-17y-female']
  }
};

// Helper function to get profile description
export const getProfileDescription = (profileId: string): string => {
  const profile = DEFAULT_PROFILES[profileId];
  if (!profile) return '';

  return `${profile.gender === 'male' ? 'Male' : 'Female'}, ${profile.age} years, ${profile.imperialHeight}, ${profile.imperialWeight} lbs`;
}; 