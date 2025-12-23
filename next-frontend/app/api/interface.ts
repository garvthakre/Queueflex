 

export interface signupData{
    name:string;
    email:string;
    password:string;
    isadmin?:boolean;
    
}
export interface SignupFormData extends signupData {
  confirmPassword: string;
}
export interface SignupResponse {
  user_id: number;
  message: string;
  is_admin: boolean;
}
 
export interface loginData{
    email:string;
    password:string;
}
export interface LoginResponse {
    token: string;
    user_id: number;
    is_admin: boolean;
}