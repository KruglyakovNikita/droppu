import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: "'PixelifySans-Bold', sans-serif", // Используйте для заголовков
    body: "'PixelifySans-Regular', sans-serif", // Используйте для основного текста
  },
});

export default theme;