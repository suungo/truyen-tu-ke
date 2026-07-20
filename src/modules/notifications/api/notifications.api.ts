import { apiClient } from "@/apis";

export interface AdminNotification {
  id: number;
  readerId: number | null;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  reader: {
    id: number;
    username: string;
    email: string;
  } | null;
}

export const adminGetNotifications = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ notifications: AdminNotification[]; total: number }> => {
  const res = await apiClient.get("/admin/notifications", { params });
  return res.data.data;
};

export const adminDeleteNotification = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/notifications/${id}`);
};
