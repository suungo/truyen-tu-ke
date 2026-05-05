import { QueryClient } from "@tanstack/react-query";

// Tạo QueryClient instance để sử dụng trong toàn bộ ứng dụng
// Tắt retry mặc định của React Query vì đã dùng axios-retry để xử lý retry logic
// axios-retry sẽ retry tối đa 2 lần (tổng 3 lần thử) cho lỗi server
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Tắt retry của React Query, để axios-retry xử lý
      refetchOnWindowFocus: false, // Không tự động refetch khi focus window
    },
    mutations: {
      retry: false, // Tắt retry cho mutations
    },
  },
});
