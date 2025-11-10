import { DEFAULT_PROFILES } from '../data/defaults';
import type { HouseholdConfig, Person } from '../types/calculator';

const ADULT_PROFILES = ['adult-male', 'adult-female'] as const;
const CHILD_PROFILES = ['kid-7y-male', 'kid-10y-female', 'teen-13y-male', 'teen-16y-female'] as const;

const createPerson = (profileKey: string, id: string, label: string): Person => {
  const profile = DEFAULT_PROFILES[profileKey];
  if (!profile) {
    throw new Error(`Unknown profile key: ${profileKey}`);
  }

  return {
    ...profile,
    id,
    label,
  };
};

export const buildHouseholdMembers = (household: HouseholdConfig): Person[] => {
  const members: Person[] = [];

  for (let index = 0; index < household.adults; index += 1) {
    const profileKey = ADULT_PROFILES[index % ADULT_PROFILES.length];
    members.push(
      createPerson(profileKey, `adult-${index + 1}`, `Adult ${index + 1}`),
    );
  }

  for (let index = 0; index < household.children; index += 1) {
    const profileKey = CHILD_PROFILES[index % CHILD_PROFILES.length];
    members.push(
      createPerson(profileKey, `child-${index + 1}`, `Child ${index + 1}`),
    );
  }

  return members;
};

export const syncHouseholdMembers = (
  current: Person[],
  household: HouseholdConfig,
): Person[] => {
  const baseline = buildHouseholdMembers(household);

  return baseline.map((person, index) => {
    const existing = current[index];
    if (!existing) {
      return person;
    }

    return {
      ...person,
      ...existing,
      id: person.id,
      label: person.label,
    };
  });
};

export const updatePersonAtIndex = (
  people: Person[],
  index: number,
  update: Partial<Person>,
): Person[] => {
  return people.map((person, idx) => {
    if (idx !== index) {
      return person;
    }

    const next = { ...person, ...update };

    if (update.imperialWeight !== undefined && !update.metricWeight) {
      next.metricWeight = Math.round(update.imperialWeight * 0.453592);
    }

    if (update.metricWeight !== undefined && !update.imperialWeight) {
      next.imperialWeight = Math.round(update.metricWeight / 0.453592);
    }

    return next;
  });
};
