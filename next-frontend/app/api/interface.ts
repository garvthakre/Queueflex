export interface signupData {
  name: string;
  email: string;
  password: string;
  isadmin?: boolean;
}
export interface SignupFormData extends signupData {
  confirmPassword: string;
}
export interface SignupResponse {
  user_id: number;
  message: string;
  is_admin: boolean;
}
export interface loginData {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  user_id: number;
  is_admin: boolean;
  
}
export interface BookingResponseData {
  queue_id: string;
  user_id: number;
  service_id: number;
  name: string;
  purpose: string;
  serviceType: string;
  position?: number;
  status?: string;
}
export interface BookingRequestData {
  service_id: number;
  purpose: string;
  name: string;
}
export interface Service {
  id: number;
  name: string;
  description?: string;
  serviceType?: string;
  current_queue_count?: number;
}
export interface ServiceAPIResponse {
  service_id: number
  name: string
  description?: string
  serviceType?: string
  current_queue_count?: number
}
