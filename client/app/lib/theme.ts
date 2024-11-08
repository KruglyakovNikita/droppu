import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Configuration for the theme to set light mode as the default
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Extend the theme
const theme = extendTheme({ config });

export default theme;
