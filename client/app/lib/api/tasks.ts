import apiService from ".";
import { Task } from "../store/types";


export const getTasks = async () => {
  const response = await apiService.get<Task[]>(
    "/api/v1/tasks/incomplete"
  );

  return response;
};

export const completeTask = async (taskId: integer) => {
  const response = await apiService.post<Task>(
    `/api/v1/tasks/${taskId}/complete`,
    {}
  );

  if (response.error) {
    console.error("Task complete error:", response.error);
  } else if (response.data) {
    return response;
  }
};