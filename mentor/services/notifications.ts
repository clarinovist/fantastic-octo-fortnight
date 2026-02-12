import { BaseResponse } from "@/utils/types";
import { Notification, NotificationFilters } from "@/utils/types/notification";
import { fetcherBase } from "./base";

export async function getNotifications(filters?: NotificationFilters): Promise<BaseResponse<Notification[]>> {
    const query = new URLSearchParams();
    if (filters?.page) query.append("page", filters.page.toString());
    if (filters?.limit) query.append("limit", filters.limit.toString());
    if (filters?.isRead !== undefined) query.append("isRead", filters.isRead.toString());

    return fetcherBase<Notification[]>(`/v1/notifications?${query.toString()}`);
}

export async function markAsRead(id: string): Promise<BaseResponse<void>> {
    return fetcherBase<void>(`/v1/notifications/${id}/read`, {
        method: "PUT",
    });
}

export async function deleteNotification(id: string): Promise<BaseResponse<void>> {
    return fetcherBase<void>(`/v1/notifications/${id}`, {
        method: "DELETE",
    });
}

export async function dismissNotification(id: string): Promise<BaseResponse<void>> {
    return fetcherBase<void>(`/v1/notifications/${id}/dismiss`, {
        method: "PUT",
    });
}
