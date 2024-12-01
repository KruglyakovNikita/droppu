import { Box, Heading } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Game = dynamic(() => import("../app/game/Game"), { ssr: false });

export default function GamePage() {
  const router = useRouter();
  return (
    <Box p={4} textAlign="center">
      <Game
        gameId="unique-game-id-123"
        booster={1}
        userSkinUrl="/player/granny1.png"
        userSpriteUrl="/player/granny2.png"
        onGameEnd={() => {
          console.log("FOFOFOFOSAFASFAS");
          router.push("/");
        }}
        onPurchaseAttempt={async (num: number) => {
          console.log("YOUUOUO");
          return "ok";
        }}
      />
    </Box>
  );
}
