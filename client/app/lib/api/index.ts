const API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken") ?? "";
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem("accessToken", token);
  }

  removeAccessToken() {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      const data: T = await response.json();
      return { data, error: null };
    } catch (error: any) {
      throw new Error(error.message || "Network error");
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      const data: T = await response.json();
      return { data, error: null };
    } catch (error: any) {
      throw new Error(error.message || "Network error");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }
}

const apiService = new ApiService();
export default apiService;