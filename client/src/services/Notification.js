import api from "./api";

const validateId = (id) => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error("A valid notification ID is required.");
  }
};

// Get all notifications
export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

// Get unread notification count
export const getUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread-count");

  const count = Number(data?.count ?? data?.unreadCount ?? 0);

  return Number.isFinite(count) && count >= 0 ? count : 0;
};

// Mark one notification as read
export const markNotificationRead = async (id) => {
  validateId(id);

  const { data } = await api.patch(
    `/notifications/${encodeURIComponent(id)}/read`
  );

  return data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  validateId(id);

  const { data } = await api.delete(
    `/notifications/${encodeURIComponent(id)}`
  );

  return data;
};