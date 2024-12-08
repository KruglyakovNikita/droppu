import apiService from ".";
import { IInitReq } from "../store/types";

export const initUser = async (initData: any) => {
  const response = await apiService.post<IInitReq>("/api/v1/users/init/", {
    init_data: initData,
  });

  if (response.error) {
    console.error("Registration error:", response.error);
  } else if (response?.data?.accessToken) {
    apiService.setAccessToken(response.data.accessToken);
  }

  return response;
};
