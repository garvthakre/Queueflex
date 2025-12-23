import { apiClient } from "../api/config";
import { loginData, LoginResponse, signupData, SignupResponse } from "../api/interface";
const authService = {
  Signup: async (
    params: signupData
  ): Promise<SignupResponse> => {
    try {
    const response = await apiClient.post<SignupResponse>('/signup', params);
    return response.data;
    } catch (error: unknown) {
    throw error || error;
    }
  },
  Login : async (
    params:loginData
  ): Promise<LoginResponse>=>{
    try {
      const response = await apiClient.post<LoginResponse>('/login',params);
      return response.data;
      } catch (error: unknown) {
      throw error || error;
      }
  }
}

export default authService;