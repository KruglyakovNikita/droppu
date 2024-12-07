import {
  createPurchaseAttempt,
  ICreatePayTicketAttempt,
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
        // Open the invoice
        await window.Telegram.WebApp.openInvoice(data?.payment_url);

        // Wait for the 'invoiceClosed' event
        const eventData: any = await new Promise((resolve, reject) => {
          const handler = (eventData) => {
            // Remove the event listener after receiving the event
            window.Telegram.WebApp.offEvent("invoiceClosed", handler);
            resolve(eventData);
          };
          window.Telegram.WebApp.onEvent("invoiceClosed", handler);
        });

        console.log("Invoice closed event data:", eventData);

        // React based on the payment status
        if (eventData.status === "paid") {
          // Payment was successful
          return "ok";
        } else {
          // Payment was cancelled or failed
          return "canceled";
        }
      }
    } catch (err) {
      console.log(err);
      return "canceled";
    }
    return "canceled";
  };

  const payTicketForGameHandler = async ({
    session_id,
  }: ICreatePayTicketAttempt) => {
    try {
      const data = await createPurchaseAttempt({
        amount: 5,
        description: JSON.stringify(session_id),
      });
      console.log("startPurchaseAttemptHandler");
      console.log(data);
      if (data?.payment_url) {
        // Open the invoice
        await window.Telegram.WebApp.openInvoice(data?.payment_url);

        // Wait for the 'invoiceClosed' event
        const eventData: any = await new Promise((resolve, reject) => {
          const handler = (eventData) => {
            // Remove the event listener after receiving the event
            window.Telegram.WebApp.offEvent("invoiceClosed", handler);
            resolve(eventData);
          };
          window.Telegram.WebApp.onEvent("invoiceClosed", handler);
        });

        console.log("Invoice closed event data:", eventData);

        // React based on the payment status
        if (eventData.status === "paid") {
          // Payment was successful
          return "ok";
        } else {
          // Payment was cancelled or failed
          return "canceled";
        }
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
        payTicketForGame={payTicketForGameHandler}
      />
    </Box>
  );
}
