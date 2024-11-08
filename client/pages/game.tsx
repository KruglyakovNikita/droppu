import { Box, Heading } from "@chakra-ui/react";
import Game from "../app/game/Game";

export default function GamePage() {
  return (
    <Box p={4} textAlign="center">
      <Heading>Game Page</Heading>
      <Game />
    </Box>
  );
}
