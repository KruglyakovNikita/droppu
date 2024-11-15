import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Configuration for the theme to set light mode as the default
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Extend the theme

const theme = extendTheme({
  config,
  styles: {
    global: {
      "html, body, #__next": {
        overflow: "hidden",
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
      },
    },
  },
});

export default theme;
