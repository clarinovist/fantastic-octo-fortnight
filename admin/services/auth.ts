import type { BaseResponse, GoogleAuthResponse, LoginResponse } from "@/utils/types";
import { fetcherBase } from "./base";

type AuthGoogle = {
  roleName?: "student" | "tutor";
  idToken: string;
}

export async function login(body: { email: string; password: string; }): Promise<BaseResponse<LoginResponse>> {
  return fetcherBase<LoginResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function authGoogle(payload: AuthGoogle): Promise<BaseResponse<GoogleAuthResponse>> {
  return fetcherBase<GoogleAuthResponse>('/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string): Promise<BaseResponse<{ message: string }>> {
  return fetcherBase<{ message: string }>('/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<BaseResponse<{ message: string }>> {
  return fetcherBase<{ message: string }>('/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
