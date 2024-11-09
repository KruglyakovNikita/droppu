import apiService from ".";
import { Achievement } from "../store/types";

interface GetAchievements {
  achievements: Achievement[];
}

export const getAchievements = async () => {
  const response = await apiService.get<GetAchievements>(
    "/api/v1/achievement/"
  );
  console.log("Achievements data response");
  console.log(response);

  return response;
};
