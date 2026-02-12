export interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    type: "info" | "success" | "warning" | "error";
    is_read: boolean;
    created_at: string;
}

export interface NotificationFilters {
    page?: number;
    limit?: number;
    isRead?: boolean;
}
