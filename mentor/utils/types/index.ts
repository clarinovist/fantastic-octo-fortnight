export type BaseResponse<T> = {
    data: T;
    statusCode: number;
    success: boolean
    message?: string;
    error?: string
    code?: number
    metadata?: Metadata
}

export type Metadata = {
    page: number,
    pageSize: number,
    total: number,
    total_items?: number,
    total_pages?: number,
    current_page?: number
}

export type Lookup = {
    type: string;
    code: string;
    description: string;
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

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    photo_profile?: string;
    phone_number?: string;
    address?: string;
    joined_at?: string;
    total_sessions?: number;
    average_rating?: number;
    gender?: string;
    date_of_birth?: string;
    social_media_link?: Record<string, string>;
    location?: {
        name: string;
        latitude?: number;
        longitude?: number;
    };
    bio?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    is_read: boolean;
    is_dismissed: boolean;
    created_at: string;
}
