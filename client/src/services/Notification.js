
import api from "./api";

// Get all notifications
export const getNotifications = async () => {
  const { data } = await api.get("/notifications");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;

  return [];
};

// Get unread notification count
export const getUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread-count");

  return Number(data?.count ?? data?.unreadCount ?? 0);
};

// Mark a notification as read
export const markNotificationRead = async (id) => {
  if (!id) {
    throw new Error("Notification ID is required.");
  }

  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  if (!id) {
    throw new Error("Notification ID is required.");
  }

  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};
