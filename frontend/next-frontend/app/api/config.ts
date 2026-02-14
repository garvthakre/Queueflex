 
import axios, { AxiosInstance } from "axios";

// Helper to get base URL - works both server and client side
const getBaseURL = (envKey: string, defaultPort: string) => {
  // Check if we're in browser
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ variables
    const url = process.env[`NEXT_PUBLIC_${envKey}_SERVICE_URL`];
    if (url) {
      console.log(`[${envKey}] Using client URL:`, url);
      return url;
    }
  }
  
  // Server-side or fallback to localhost
  const fallback = `http://localhost:${defaultPort}`;
  console.log(`[${envKey}] Using fallback URL:`, fallback);
  return fallback;
};

// Auth service
export const authApi = axios.create({
  baseURL: getBaseURL('AUTH', '3000'),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Queue service
export const queueApi = axios.create({
  baseURL: getBaseURL('QUEUE', '4000'),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

// Admin service
export const AdminApi = axios.create({
  baseURL: getBaseURL('ADMIN', '5000'),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

// Function to attach interceptor to an Axios instance
function attachAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(
    (config) => {
      // Only access localStorage in browser
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        console.log(`[Interceptor ${api.defaults.baseURL}] Token:`, token ? 'present' : 'missing');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for better error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error(`[API Error ${error.config.url}]`, error.response.status, error.response.data);
      } else if (error.request) {
        console.error(`[Network Error ${error.config.url}]`, 'No response received');
      } else {
        console.error(`[Request Error]`, error.message);
      }
      return Promise.reject(error);
    }
  );
}

// Attach to all backend APIs
attachAuthInterceptor(authApi);
attachAuthInterceptor(queueApi);
attachAuthInterceptor(AdminApi);

// Log configuration on initialization
if (typeof window !== 'undefined') {
  console.log(' API Configuration:');
  console.log('   Auth API:', authApi.defaults.baseURL);
  console.log('   Queue API:', queueApi.defaults.baseURL);
  console.log('   Admin API:', AdminApi.defaults.baseURL);
}