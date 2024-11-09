export type User = {
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
