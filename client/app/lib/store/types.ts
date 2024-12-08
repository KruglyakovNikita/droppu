import { GameType } from "../shared/game";

export type User = {
  active_skin_id: null;
  tg_id: number;
  language: string;
  active_jetpack_id: null;
  is_first_login: true;
  username: string;
  coins: number;
  tokens: number;
  game_high_score: number;
  check_in: boolean;
  tickets: number;
  id: number;
};

export type TelegramUser = {
  id: number;
  photo_url: string;
  username: number;
};

export type Game = {
  session_id: string;
  type: GameType;
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
};

export type ReferralUser = {
  referral_id: number;
  username: string;
  registration_date: string;
  total_earned: number;
  indirect_referrals_count: number;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
  rank: number;
};

export type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  me: LeaderboardEntry;
};

export interface FirstLoginInfo {
  years_telegram: number;
  is_premium: boolean;
  date_telegram: string;
  premium_coins: number;
  years_coins: number;
  welcome_tickets: number;
  welcome_coins: number;
}

export interface CheckInInfo {
  check_in_days: number;
  check_in_tickets: number;
  check_in_coins: number;
}
export interface IInitReq {
  user: User;
  first_login_info: FirstLoginInfo;
  check_in_info: CheckInInfo;
  accessToken: string;
}
