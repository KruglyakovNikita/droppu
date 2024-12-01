import apiService from ".";
import { LeaderboardData } from "../store/types";

export const fetchLeaderboard = async (period: string) => {
  const response = await apiService.get<{ data: LeaderboardData }>(`/api/v1/leaderboard/${period}`);
  return response;
};
