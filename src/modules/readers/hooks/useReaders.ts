import { useQuery, useMutation } from "@tanstack/react-query";
import { adminGetReaders, adminGetReaderStats, adminSendNotification } from "../api/readers.api";

export function useAdminReaders(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-readers", params],
    queryFn: () => adminGetReaders(params),
  });
}

export function useAdminReaderStats(id: number) {
  return useQuery({
    queryKey: ["admin-reader-stats", id],
    queryFn: () => adminGetReaderStats(id),
    enabled: !!id,
  });
}

export function useAdminSendNotification() {
  return useMutation({
    mutationFn: adminSendNotification,
  });
}
