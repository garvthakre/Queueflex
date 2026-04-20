export interface signupData {
  name: string;
  email: string;
  password: string;
  is_admin?: boolean;
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
  admin: boolean;
}

export interface BookingResponseData {
  queue_id: string;
  user_id: number;
  service_id: string;
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
  service_id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  max_capacity?: number;
  estimated_time_per_person?: number;
  current_queue_count?: number;
  created_by?: number;
  serviceType?: string;
}