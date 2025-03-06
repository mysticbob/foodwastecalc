import React from 'react';
import { Container, Heading, Image, VStack } from '@chakra-ui/react';
import CalorieCalculator from './components/CalorieCalculator';
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Image 
          src="/assets/images/ovie-logo.png" 
          alt="Ovie" 
          height="60px"
          mb={4}
        />
        <Heading textAlign="center" mb={8} color="ovie.500">
          Food Waste Cost Calculator
        </Heading>
        <CalorieCalculator />
      </VStack>
      <Analytics />
    </Container>
  );
};

export default App; 