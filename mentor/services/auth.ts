import type { BaseResponse, LoginResponse, User } from "@/utils/types";
import { fetcherBase } from "./base";

export async function login(body: { email: string; password: string; }): Promise<BaseResponse<LoginResponse>> {
    return fetcherBase<LoginResponse>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
export async function getProfile(): Promise<BaseResponse<User>> {
    return fetcherBase<User>('/v1/me');
}

interface UpdateProfilePayload {
    name?: string;
    phoneNumber?: string;
    address?: string;
    photoProfile?: string;
}

interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

interface UploadResult {
    url: string;
}

export async function updateProfile(body: UpdateProfilePayload): Promise<BaseResponse<User>> {
    return fetcherBase<User>('/v1/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export async function uploadFile(file: File): Promise<BaseResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return fetcherBase<UploadResult>('/v1/files/upload', {
        method: 'POST',
        body: formData,
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

export async function changePassword(body: ChangePasswordPayload): Promise<BaseResponse<null>> {
    return fetcherBase<null>('/v1/auth/password', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}
