import { Box, Heading } from "@chakra-ui/react";
import dynamic from "next/dynamic";

// const Game = dynamic(() => import("../app/game/Game"), { ssr: false });

export default function GamePage() {
  return (
    <Box p={4} textAlign="center">
      <Heading>Game Page</Heading>
      {/* <Game /> */}
    </Box>
  );
}
