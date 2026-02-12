export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  loginSource: string;
  createdAt: string;
}
export interface VerifyResponse {
  message: string;
  verified: boolean;
}
export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  loginSource: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
}
export interface GoogleAuthResponse {
  id: string;
  name: string;
  email: string;
  loginSource: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  isNewUser: boolean;
}