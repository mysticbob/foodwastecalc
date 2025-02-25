import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    ovie: {
      500: '#40BFB4', // Main teal color from website
      600: '#389f96', // Slightly darker for hover states
      700: '#308780', // Even darker for active states
      50: '#e6f7f5',  // Very light teal for backgrounds
    }
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  }
});

export default theme; 