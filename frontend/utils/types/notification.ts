export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  type: "info" | "success" | "error" | "warning";
  isDismissed: boolean;
  isDeletable: boolean;
  createdAt: string;
}