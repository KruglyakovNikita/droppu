import { Box, VStack } from "@chakra-ui/react";
import NavBar from "./NavBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <VStack minHeight="100vh" align="stretch">
      <Box flex={1} as="main">
        {children}
      </Box>
      <NavBar />
    </VStack>
  );
};

export default Layout;
