import { apiClient } from "@/apis";

export interface Reader {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  totalRegistered: number;
}

export interface ReaderStats {
  reader: {
    id: number;
    username: string;
    email: string;
    createdAt: string;
  };
  totalRegistered: number;
  totalApproved: number;
  totalRejected: number;
}

export const adminGetReaders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ readers: Reader[]; total: number }> => {
  const res = await apiClient.get("/admin/readers", { params });
  return res.data.data;
};

export const adminGetReaderStats = async (id: number): Promise<ReaderStats> => {
  const res = await apiClient.get(`/admin/readers/${id}/stats`);
  return res.data.data;
};

export const adminSendNotification = async (dto: {
  readerId: number | null;
  title: string;
  content: string;
}): Promise<any> => {
  const res = await apiClient.post("/admin/notifications", dto);
  return res.data;
};
