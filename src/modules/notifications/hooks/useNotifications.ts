import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetNotifications, adminDeleteNotification } from "../api/notifications.api";

export function useAdminNotifications(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-notifications", params],
    queryFn: () => adminGetNotifications(params),
  });
}

export function useAdminDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
}
