import {  authApi } from "../api/config";
import { loginData, LoginResponse, signupData, SignupResponse } from "../api/interface";
const authService = {
  Signup: async (
    params: signupData
  ): Promise<SignupResponse> => {
    try {
    const response = await authApi.post<SignupResponse>('/signup', params);
    return response.data;
    } catch (error: unknown) {
    throw error || error;
    }
  },
  Login : async (
    params:loginData
  ): Promise<LoginResponse>=>{
    try {
      const response = await authApi.post<LoginResponse>('/login',params);
      localStorage.setItem("token", response.data.token);
 
      console.log("Token in authService:", response.data.token);
      return response.data;
      } catch (error: unknown) {
      throw error || error;
      }
  }
}

export default authService;