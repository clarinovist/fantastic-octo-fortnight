import type { BaseResponse } from "@/utils/types";
import { fetcherBase } from "./base";

export type NotificationPayload = {
  title: string;
  message: string;
  link?: string;
  type: "email" | "notification";
  userIds: string[];
}

export async function sendNotifications(payload: NotificationPayload): Promise<BaseResponse<null>> {
  return fetcherBase<null>('/v1/admin/notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
