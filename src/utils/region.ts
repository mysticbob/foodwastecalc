const STATE_COST_MULTIPLIERS: Record<string, number> = {
  // Northeast
  '00': 1.15,
  '10': 1.15,
  '11': 1.15,
  '12': 1.05,
  '13': 1.05,
  '14': 1.05,
  '06': 1.2,
  '02': 1.2,
  '03': 1.1,
  '04': 1.1,
  '05': 1.1,
  '01': 1.15,
  '19': 1.15,
  '07': 1.2,
  '08': 1.2,

  // Midwest
  '48': 1.0,
  '49': 1.0,
  '53': 0.95,
  '54': 0.95,
  '55': 0.95,
  '60': 1.05,
  '61': 1.0,
  '62': 1.0,
  '50': 0.85,
  '51': 0.85,
  '52': 0.85,
  '56': 0.9,
  '57': 0.9,
  '43': 0.95,
  '44': 0.95,
  '45': 0.95,
  '46': 0.95,
  '47': 0.95,

  // West Coast
  '90': 1.25,
  '91': 1.25,
  '92': 1.25,
  '93': 1.2,
  '94': 1.25,
  '95': 1.25,
  '96': 1.2,
  '97': 1.15,
  '98': 1.2,
  '99': 1.15,

  // South
  '30': 1.0,
  '31': 0.95,
  '32': 1.05,
  '33': 1.05,
  '34': 1.05,
  '35': 0.9,
  '36': 0.9,
  '37': 0.95,
  '38': 0.9,
  '39': 0.9,
  '27': 0.95,
  '28': 0.95,
};

const METRO_COST_MULTIPLIERS: Record<string, number> = {
  '100': 1.45,
  '101': 1.45,
  '102': 1.45,
  '112': 1.35,
  '104': 1.35,
  '110': 1.3,
  '481': 1.05,
  '482': 1.08,
  '606': 1.25,
  '945': 1.5,
  '946': 1.5,
  '900': 1.35,
  '901': 1.35,
  '980': 1.35,
  '021': 1.35,
  '022': 1.35,
  '190': 1.25,
  '191': 1.25,
  '076': 1.3,
  '335': 1.2,
  '336': 1.2,
  '300': 1.15,
  '770': 1.2,
  '780': 1.2,
  '479': 1.02,
  '618': 1.05,
  '489': 1.03,
  '537': 1.0,
  '430': 1.0,
};

const METRO_NAMES: Record<string, string> = {
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
};

const STATE_NAMES: Record<string, string> = {
  '48': 'Michigan',
  '10': 'New York',
  '11': 'New York',
  '90': 'California',
  '60': 'Illinois',
};

export const getRegionalMultiplier = (zipCode: string): number => {
  const sanitizedZip = zipCode.trim();
  if (!sanitizedZip) {
    return 1;
  }

  const firstThree = sanitizedZip.substring(0, 3);
  if (METRO_COST_MULTIPLIERS[firstThree]) {
    return METRO_COST_MULTIPLIERS[firstThree];
  }

  const firstTwo = sanitizedZip.substring(0, 2);
  return STATE_COST_MULTIPLIERS[firstTwo] ?? 1;
};

export const getRegionName = (zipCode: string): string => {
  const sanitizedZip = zipCode.trim();
  if (!sanitizedZip) {
    return 'United States';
  }

  const firstThree = sanitizedZip.substring(0, 3);
  if (METRO_NAMES[firstThree]) {
    return METRO_NAMES[firstThree];
  }

  const firstTwo = sanitizedZip.substring(0, 2);
  const baseName = STATE_NAMES[firstTwo] ?? 'United States';
  const isMetro = Boolean(METRO_COST_MULTIPLIERS[firstThree]);

  return isMetro ? `${baseName} Metro Area` : baseName;
};
