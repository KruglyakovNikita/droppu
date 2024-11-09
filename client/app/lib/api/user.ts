import apiService from ".";
import { User } from "../store/types";

export const initUser = async (initData: any) => {
  const response = await apiService.post<{ user: User; accessToken: string }>(
    "/api/v1/users/init/",
    {
      init_data: initData,
    }
  );
  console.log("INIT data response");
  console.log(response);

  if (response.error) {
    console.error("Registration error:", response.error);
  } else if (response.data) {
    apiService.setAccessToken(response.data.accessToken);
  }

  return response;
};
