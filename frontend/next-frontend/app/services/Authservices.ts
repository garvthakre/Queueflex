import { authApi } from "../api/config";
import {
  loginData,
  LoginResponse,
  signupData,
  SignupResponse,
} from "../api/interface";
const authService = {
  Signup: async (params: signupData): Promise<SignupResponse> => {
    try {
      const response = await authApi.post<SignupResponse>("/signup", params);
      return response.data;
    } catch (error: unknown) {
      throw error || error;
    }
  },
  Login: async (params: loginData): Promise<LoginResponse> => {
    try {
      const response = await authApi.post<LoginResponse>("/login", params);
      // persist token and basic user info for frontend filtering
      localStorage.setItem("token", response.data.token);
      try {
        localStorage.setItem("user_id", String(response.data.user_id));
        localStorage.setItem("is_admin", response.data.admin ? "1" : "0");
      } catch (e) {
        console.warn("Could not persist user info to localStorage", e);
      }

      console.log("Token in authService:", response.data.token);
      return response.data;
    } catch (error: unknown) {
      throw error || error;
    }
  },
};

export default authService;
