import { QueryClient } from "@tanstack/react-query";

// Tạo QueryClient instance để sử dụng trong toàn bộ ứng dụng
// Tắt retry mặc định của React Query vì đã dùng axios-retry để xử lý retry logic
// axios-retry sẽ retry tối đa 2 lần (tổng 3 lần thử) cho lỗi server
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
