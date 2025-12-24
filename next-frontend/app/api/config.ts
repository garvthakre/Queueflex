import axios, { AxiosInstance } from "axios";

// Auth service
export const authApi = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Queue service
export const queueApi = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Function to attach interceptor to an Axios instance
function attachAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem("token");
      console.log(`[Interceptor ${api.defaults.baseURL}] token =`, token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    error => Promise.reject(error)
  );
}

// attach to ALL backend APIs
attachAuthInterceptor(authApi);
attachAuthInterceptor(queueApi);
