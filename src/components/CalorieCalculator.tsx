import React from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useHouseholdCalculator } from '../hooks/useHouseholdCalculator';
import type {
  ActivityLevel,
  HouseholdResults,
  Person,
  ShoppingPreferences,
} from '../types/calculator';

const activityOptions: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'veryActive', label: 'Very Active' },
];

const costTierOptions: Array<{ value: ShoppingPreferences['costTier']; label: string; helper: string }> = [
  { value: 'budget', label: 'Budget', helper: 'Warehouse clubs, discount grocers' },
  { value: 'moderate', label: 'Moderate', helper: 'Traditional grocery mix' },
  { value: 'premium', label: 'Premium', helper: 'Organic or specialty focus' },
];

const prepStyleOptions: Array<{ value: ShoppingPreferences['prepStyle']; label: string; helper: string }> = [
  { value: 'mostly_home', label: 'Mostly Home-Cooked', helper: 'Primarily cooking at home' },
  { value: 'mixed', label: 'Mixed', helper: 'Blend of cooking & prepared meals' },
  { value: 'mostly_prepared', label: 'Mostly Prepared', helper: 'Carry-out & prepared foods' },
];

const storeTypeOptions: Array<{ value: ShoppingPreferences['storeType']; label: string; helper: string }> = [
  { value: 'discount', label: 'Discount', helper: 'Aldi, Lidl, Trader Joe’s' },
  { value: 'standard', label: 'Standard', helper: 'Regional grocers, big box' },
  { value: 'premium', label: 'Premium', helper: 'Whole Foods, specialty markets' },
];

const wasteLevelOptions: Array<{ value: ShoppingPreferences['wasteLevel']; label: string; helper: string }> = [
  { value: 'low', label: 'Hardly Any (5%)', helper: 'Tight meal planning, tech-assisted' },
  { value: 'average', label: 'Average (20%)', helper: 'Typical U.S. household' },
  { value: 'high', label: 'Lots (35%)', helper: 'Frequent leftovers or spoilage' },
];

const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  }).format(Math.max(value, 0));

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

const ProcessingModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <Modal isOpen={isOpen} onClose={() => undefined} closeOnOverlayClick={false} isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalBody p={6} textAlign="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="ovie.500" thickness="4px" speed="0.75s" />
          <Text fontSize="xl" fontWeight="bold">
            Cooking...
          </Text>
          <Text>Preparing your personalized food waste results</Text>
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

interface HouseholdSectionProps {
  adults: number;
  children: number;
  zipCode: string;
  mealsOutPerWeek: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onZipChange: (value: string) => void;
  onMealsOutChange: (value: number) => void;
}

const HouseholdSection: React.FC<HouseholdSectionProps> = ({
  adults,
  children,
  zipCode,
  mealsOutPerWeek,
  onAdultsChange,
  onChildrenChange,
  onZipChange,
  onMealsOutChange,
}) => (
  <Box>
    <Heading as="h2" size="md" mb={4} color="ovie.700">
      Household Snapshot
    </Heading>
    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
      <FormControl>
        <FormLabel>Adults</FormLabel>
        <NumberInput min={1} max={6} value={adults} onChange={(_, valueAsNumber) => onAdultsChange(valueAsNumber || 1)}>
          <NumberInputField aria-label="Number of adults in household" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>Include anyone 18+</FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Children</FormLabel>
        <NumberInput
          min={0}
          max={8}
          value={children}
          onChange={(_, valueAsNumber) => onChildrenChange(valueAsNumber || 0)}
        >
          <NumberInputField aria-label="Number of children in household" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>Age 0-17</FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>ZIP Code</FormLabel>
        <Input
          type="text"
          value={zipCode}
          onChange={(event) => onZipChange(event.target.value)}
          placeholder="Enter ZIP code"
          inputMode="numeric"
          maxLength={5}
        />
        <FormHelperText>We adjust for regional pricing</FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Meals Out Per Week</FormLabel>
        <NumberInput
          min={0}
          max={21}
          value={mealsOutPerWeek}
          onChange={(_, valueAsNumber) => onMealsOutChange(valueAsNumber || 0)}
        >
          <NumberInputField aria-label="Meals eaten outside the home per week" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>Across the entire household</FormHelperText>
      </FormControl>
    </SimpleGrid>
  </Box>
);

interface EmailCaptureProps {
  email: string;
  emailError: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onValidate: () => boolean;
  onSubmit: () => Promise<void>;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({
  email,
  emailError,
  isSubmitting,
  onEmailChange,
  onValidate,
  onSubmit,
}) => (
  <Box p={3} bg="blue.50" borderRadius="md" borderLeftWidth={4} borderColor="blue.400">
    <Text fontSize="md" mb={2}>
      Send the detailed breakdown to your inbox and unlock 20% off your first order.
    </Text>
    <FormControl isInvalid={Boolean(emailError)}>
      <Flex gap={2} direction={{ base: 'column', md: 'row' }}>
        <Input
          placeholder="Your email address"
          bg="white"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          isDisabled={isSubmitting}
          onBlur={onValidate}
          _invalid={{
            borderColor: 'red.300',
            boxShadow: '0 0 0 1px red.300',
          }}
        />
        <Button colorScheme="blue" onClick={onSubmit} isLoading={isSubmitting} loadingText="Submitting">
          Submit
        </Button>
      </Flex>
      {emailError ? <FormErrorMessage pl={1}>{emailError}</FormErrorMessage> : null}
    </FormControl>
  </Box>
);

interface ResultsProps {
  householdResults: HouseholdResults;
  regionalInsights: {
    name: string;
    multiplier: number;
    mealsInCost: number;
    mealsOutCost: number;
    totalMultiplier: number;
  } | null;
  isCustomizeOpen: boolean;
  toggleCustomize: () => void;
  people: Person[];
  onPersonChange: (index: number, update: Partial<Person>) => void;
  preferences: ShoppingPreferences;
  onPreferenceChange: <Key extends keyof ShoppingPreferences>(
    key: Key,
    value: ShoppingPreferences[Key],
  ) => void;
}

const ResultsSection: React.FC<ResultsProps> = ({
  householdResults,
  regionalInsights,
  isCustomizeOpen,
  toggleCustomize,
  people,
  onPersonChange,
  preferences,
  onPreferenceChange,
}) => {
  const stats = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(householdResults.totalMonthlyCost),
      helper: `${formatCurrency(householdResults.totalDailyCost, {
        maximumFractionDigits: 2,
      })} per day`,
    },
    {
      label: 'Daily Calories',
      value: `${formatNumber(householdResults.totalCalories)} kcal`,
      helper: 'Across your entire household',
    },
    {
      label: 'Food Waste Opportunity',
      value: formatCurrency(householdResults.wastedCost),
      helper: `${formatNumber(householdResults.wastedCalories)} kcal going uneaten`,
    },
  ];

  const preferenceGroups: Array<{
    title: string;
    options: typeof costTierOptions | typeof prepStyleOptions | typeof storeTypeOptions | typeof wasteLevelOptions;
    name: keyof ShoppingPreferences;
  }> = [
    { title: 'Budget Level', options: costTierOptions, name: 'costTier' },
    { title: 'Meal Preparation', options: prepStyleOptions, name: 'prepStyle' },
    { title: 'Shopping Venues', options: storeTypeOptions, name: 'storeType' },
    { title: 'Food Waste Habits', options: wasteLevelOptions, name: 'wasteLevel' },
  ];

  const breakEvenCopy =
    householdResults.wastedCost >= 20
      ? 'less than a month'
      : householdResults.wastedCost > 0
        ? `${Math.max(1, Math.ceil(20 / householdResults.wastedCost))} months`
        : 'as soon as you start saving leftovers';

  return (
    <Box width="full" p={6} bg="ovie.50" borderRadius="md">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h3" size="lg" color="ovie.700" mb={4}>
            Your Household Snapshot
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {stats.map((stat) => (
              <Stat key={stat.label} p={4} bg="white" borderRadius="lg" shadow="sm">
                <StatLabel fontWeight="medium">{stat.label}</StatLabel>
                <StatNumber>{stat.value}</StatNumber>
                <StatHelpText>{stat.helper}</StatHelpText>
              </Stat>
            ))}
          </SimpleGrid>
          {regionalInsights ? (
            <Text fontSize="sm" color="ovie.600" mt={3}>
              Adjusted for {regionalInsights.name} pricing (multiplier {regionalInsights.multiplier.toFixed(2)}x). Average
              home-cooked meal costs {formatCurrency(regionalInsights.mealsInCost, { maximumFractionDigits: 2 })}, while
              meals out average {formatCurrency(regionalInsights.mealsOutCost, { maximumFractionDigits: 2 })}.
            </Text>
          ) : null}
        </Box>

        <Box p={5} bg="red.50" borderRadius="md" borderLeftWidth={4} borderColor="red.400" aria-live="polite" role="note">
          <Text fontSize="xl" fontWeight="medium" color="red.700" mb={2}>
            Food Waste Costs — or Savings with{' '}
            <Link
              href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3"
              isExternal
              color="red.700"
              textDecoration="underline"
            >
              LightTag
            </Link>
            !
          </Text>
          <Text fontSize="4xl" fontWeight="bold" color="red.600">
            {formatCurrency(householdResults.wastedCost)} <Text as="span" fontSize="xl">potential waste per month</Text>
          </Text>
          <Text fontSize="md" color="red.600" mt={2}>
            One{' '}
            <Link
              href="https://ovie.life/collections/smarterware/products/ovie-lighttags-set-of-3"
              isExternal
              color="red.700"
              textDecoration="underline"
            >
              LightTag
            </Link>{' '}
            pays for itself in {breakEvenCopy}. Add a pack of six LightTags to cover your most-used containers.
          </Text>
        </Box>

        <Box>
          <Button
            onClick={toggleCustomize}
            variant="ghost"
            width="full"
            rightIcon={isCustomizeOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            color="ovie.600"
            _hover={{ bg: 'ovie.50' }}
          >
            Customize Assumptions
          </Button>
          <Collapse in={isCustomizeOpen} animateOpacity>
            <Box p={4} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.200" mt={2}>
              <Stack spacing={6}>
                <Box>
                  <Heading as="h4" size="sm" mb={3}>
                    Household Members
                  </Heading>
                  <Stack spacing={4}>
                    {people.map((person, index) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        onChange={(update) => onPersonChange(index, update)}
                        calories={householdResults.breakdown[index]?.calories ?? 0}
                        dailyCost={householdResults.breakdown[index]?.dailyCost ?? 0}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Heading as="h4" size="sm" mb={3}>
                    Cost Preferences
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {preferenceGroups.map((group) => (
                      <Box key={group.title} p={4} bg="white" borderRadius="md" shadow="sm">
                        <Text fontWeight="semibold" mb={2}>
                          {group.title}
                        </Text>
                        <RadioGroup
                          value={preferences[group.name]}
                          onChange={(value) =>
                            onPreferenceChange(group.name, value as ShoppingPreferences[typeof group.name])
                          }
                        >
                          <Stack spacing={2}>
                            {group.options.map((option) => (
                              <Radio key={option.value} value={option.value}>
                                <Text fontWeight="medium">{option.label}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {option.helper}
                                </Text>
                              </Radio>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};

interface PersonCardProps {
  person: Person;
  onChange: (update: Partial<Person>) => void;
  calories: number;
  dailyCost: number;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onChange, calories, dailyCost }) => (
  <Box p={4} bg="white" borderRadius="md" shadow="sm">
    <Text fontWeight="semibold" mb={3}>
      {person.label}
    </Text>

    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
      <FormControl>
        <FormLabel>Age</FormLabel>
        <NumberInput
          min={1}
          max={120}
          value={person.age}
          onChange={(_, valueAsNumber) => onChange({ age: valueAsNumber || person.age })}
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
        <Select value={person.gender} onChange={(event) => onChange({ gender: event.target.value as Person['gender'] })}>
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
          onChange={(_, valueAsNumber) => {
            const newWeight = valueAsNumber > 0 ? valueAsNumber : person.imperialWeight;
            onChange({
              imperialWeight: newWeight,
              metricWeight: Math.round(newWeight * 0.453592),
            });
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
          onChange={(event) => onChange({ activityLevel: event.target.value as ActivityLevel })}
        >
          {activityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
    </SimpleGrid>

    <Text fontSize="sm" mt={3}>
      {formatNumber(calories)} calories/day · {formatCurrency(dailyCost, { maximumFractionDigits: 2 })}/day
    </Text>
  </Box>
);

const CalorieCalculator: React.FC = () => {
  const toast = useToast();
  const {
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
  } = useHouseholdCalculator();

  const handleEmailSubmit = async () => {
    const success = await submitEmail();
    if (success) {
      toast({
        title: 'Results ready',
        description: 'Your personalized food waste insights are ready and headed to your inbox.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Check your email',
        description: 'Please provide a valid email address so we can send your results.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const canShowResults = resultsReady && householdResults;

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
      <ProcessingModal isOpen={isSubmitting} />
      <VStack spacing={8} align="stretch">
        <HouseholdSection
          adults={household.adults}
          children={household.children}
          zipCode={zipCode}
          mealsOutPerWeek={mealsOutPerWeek}
          onAdultsChange={(value) => updateHousehold({ adults: value })}
          onChildrenChange={(value) => updateHousehold({ children: value })}
          onZipChange={setZipCode}
          onMealsOutChange={setMealsOutPerWeek}
        />

        <EmailCapture
          email={email}
          emailError={emailError}
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onValidate={validateEmail}
          onSubmit={handleEmailSubmit}
        />

        {canShowResults && householdResults ? (
          <ResultsSection
            householdResults={householdResults}
            regionalInsights={regionalInsights}
            isCustomizeOpen={isCustomizeOpen}
            toggleCustomize={toggleCustomize}
            people={people}
            onPersonChange={updatePerson}
            preferences={shoppingPreferences}
            onPreferenceChange={updatePreference}
          />
        ) : (
          <Box
            p={5}
            borderRadius="md"
            borderWidth={1}
            borderStyle="dashed"
            borderColor="gray.200"
            textAlign="center"
          >
            <Text fontWeight="medium" color="gray.600">
              Enter your email to unlock the full savings breakdown for your household.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default CalorieCalculator;
