import qs from "qs";
import { fetcherBase } from "./base";

type GetNotificationsParams = {
  page?: number;
  pageSize?: number;
}

export const getNotifications = (params?: GetNotificationsParams) => {
  const query = qs.stringify(params);
  return fetcherBase(`/v1/notifications?${query}`);
}
