import { apiClient } from ".";

export interface Notification {
  id: number;
  readerId: number | null;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const getReaderNotifications = async (readerId: number): Promise<Notification[]> => {
  const res = await apiClient.get(`/readers/${readerId}/notifications`);
  return res.data.data;
};

export const markNotificationAsRead = async (
  readerId: number,
  id: number
): Promise<Notification> => {
  const res = await apiClient.put(`/readers/${readerId}/notifications/${id}/read`);
  return res.data.data;
};
