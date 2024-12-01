import {
  createPurchaseAttempt,
  ICreatePurchaseAttempt,
} from "@/app/lib/api/game";
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Game = dynamic(() => import("../app/game/Game"), { ssr: false });

export default function GamePage() {
  const router = useRouter();

  const startPurchaseAttemptHandler = async (body: ICreatePurchaseAttempt) => {
    try {
      const data = await createPurchaseAttempt(body);
      console.log("startPurchaseAttemptHandler");
      console.log(data);
      if (data?.payment_url) {
        const openInvoiceData = await window.Telegram.WebApp.openInvoice(
          data?.payment_url
        );
        console.log("openInvoiceData");
        console.log(openInvoiceData);
        return openInvoiceData?.invoiceClosed === "paid" ? "ok" : "canceled";
      }
    } catch (err) {
      console.log(err);
      return "canceled";
    }
    return "canceled";
  };
  return (
    <Box p={4} textAlign="center">
      <Game
        session_id={100}
        booster={1}
        userSkinUrl="/player/granny1.png"
        userSpriteUrl="/player/granny2.png"
        onGameEnd={() => {
          console.log("FOFOFOFOSAFASFAS");
          router.push("/");
        }}
        onPurchaseAttempt={startPurchaseAttemptHandler}
      />
    </Box>
  );
}
