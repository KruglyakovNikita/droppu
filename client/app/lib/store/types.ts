export type User = {
  tg_id:string;
  id: number;
  username: string;
  coins: number;
  tokens: number;
  tickets: number;
  language: string;
  region: string;
  registration_date: string;
};

export type InvitedUser = {
  id: string;
  name: string;
  tokensEarned: number;
};

export type Achievement = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  reward_coins: number;
  reward_tokens: number;
  reward_tickets: number;
  link: string;
  additional_info: string;
  type: string;
};
