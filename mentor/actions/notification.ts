"use server"

import { revalidateTag } from "next/cache";
import { markAsRead, deleteNotification } from "@/services/notifications";

export async function markAsReadAction(id: string) {
    try {
        const res = await markAsRead(id);
        revalidateTag("notifications", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}

export async function deleteNotificationAction(id: string) {
    try {
        const res = await deleteNotification(id);
        revalidateTag("notifications", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}
