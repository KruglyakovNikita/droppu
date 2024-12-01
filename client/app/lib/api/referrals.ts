import apiService from ".";
import { PendingRewards, ReferralUser } from "../store/types";

export const getPendingRewards = async () => {
  const response = await apiService.get<PendingRewards>(
    "/api/v1/referrals/pending-rewards"
  );
  return response;
};

export const claimRewards = async () => {
  const response = await apiService.post("/api/v1/referrals/claim-rewards",{});
  return response;
};

export const getReferralsList = async () => {
  const response = await apiService.get<ReferralUser[]>("/api/v1/referrals/list");
  return response;
}; 