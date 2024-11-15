import apiService from ".";
import { Task } from "../store/types";

interface GetTasks {
  tasks: Task[];  
}

export const getTasks = async () => {
  const response = await apiService.get<GetTasks>(
    "/api/v1/tasks/incomplete"
  );

  return response;
};
