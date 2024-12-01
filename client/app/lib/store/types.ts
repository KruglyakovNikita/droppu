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
  game_high_score: number;
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

export type PendingRewards = {
  total_coins: number;
  total_tickets: number;
  rewards_from: any[];
}

export type ReferralUser = {
  referral_id: number;
  username: string;
  registration_date: string;
  total_earned: number;
  indirect_referrals_count: number;
}

export type LeaderboardEntry = {
  username: string;
  score: number;
  rank: number;
}

export type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  me: LeaderboardEntry;
}