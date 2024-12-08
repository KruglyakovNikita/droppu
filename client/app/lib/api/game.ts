import apiService from ".";
import { GameType } from "../shared/game";

export interface IEndGame {
  session_id: number;
  coins_earned: number;
  score: number;
  isPaid?: boolean;
}

export interface IEndGameResponse {
  session_id: number;
}

interface IStartGame {
  game_type: GameType;
}

interface IStartGameResponse {
  session_id: number;
}
interface ICreatePurchaseAttemptResponse {
  success: boolean;
  payment_url: string;
}
export interface ICreatePurchaseAttempt {
  amount: number;
  description?: string;
}

export interface ICreatePayTicketAttempt {
  session_id: number;
}

export const startGame = async (body: IStartGame) => {
  const response = await apiService.post<IStartGameResponse>(
    "/api/v1/games/start",
    body
  );
  console.log("startGame data response");
  console.log(response);

  return response.data;
};

export const endGame = async (
  body: IEndGame
): Promise<IEndGameResponse | null> => {
  const response = await apiService.post<IEndGameResponse>(
    "/api/v1/games/end",
    body
  );
  console.log("endGame data response");
  console.log(response);
  return response.data;
};

export const createPurchaseAttempt = async ({
  amount,
  description,
}: ICreatePurchaseAttempt): Promise<ICreatePurchaseAttemptResponse | null> => {
  const response = await apiService.post<ICreatePurchaseAttemptResponse>(
    `/api/v1/payments/create-invoice?amount=${amount}&description=${
      description ?? "NOW TEST"
    }`,
    {}
  );
  console.log("createPurchaseAttempt data response");
  console.log(response);

  return response.data;
};
