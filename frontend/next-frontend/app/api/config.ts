'use client';

import axios, { AxiosInstance } from "axios";
 
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3000';
const ADMIN_SERVICE_URL = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:5000';
const QUEUE_SERVICE_URL = process.env.NEXT_PUBLIC_QUEUE_SERVICE_URL || 'http://localhost:4000';

// Debug logging
console.log(' API Configuration Loaded:');
console.log('  Auth Service:', AUTH_SERVICE_URL);
console.log('  Admin Service:', ADMIN_SERVICE_URL);
console.log('  Queue Service:', QUEUE_SERVICE_URL);

// Auth service
export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

// Queue service
export const queueApi = axios.create({
  baseURL: QUEUE_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

// Admin service
export const AdminApi = axios.create({
  baseURL: ADMIN_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

// Function to attach interceptor to an Axios instance
function attachAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        console.error(`[API Error ${error.config?.url}]`, error.response.status, error.response.data);
      } else if (error.request) {
        console.error(`[Network Error ${error.config?.url}]`, 'No response received');
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