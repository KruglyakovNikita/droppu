import apiService from ".";
import { Task } from "../store/types";


export const getTasks = async () => {
  const response = await apiService.get<Task[]>(
    "/api/v1/tasks/incomplete"
  );

  return response;
};


