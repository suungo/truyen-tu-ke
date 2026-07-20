import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { message } from "antd";
import {
  generateVideo,
  getVideoJobs,
  getVideoJob,
  deleteVideoJob,
  type GenerateVideoPayload,
} from "../api/video-generator.api";

const JOBS_KEY = "video-generator-jobs";

/** Hook load danh sách jobs */
export function useVideoJobs() {
  return useQuery({
    queryKey: [JOBS_KEY],
    queryFn: getVideoJobs,
    refetchInterval: false,
  });
}

/** Hook load 1 job */
export function useVideoJob(id: string) {
  return useQuery({
    queryKey: [JOBS_KEY, id],
    queryFn: () => getVideoJob(id),
    enabled: !!id,
  });
}

/** Hook tạo video mới */
export function useGenerateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateVideoPayload) => generateVideo(payload),
    onSuccess: () => {
      message.success("🎬 Đã nhận yêu cầu! Đang xử lý video trong nền...");
      qc.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
    onError: () => {
      message.error("Không thể tạo video. Vui lòng thử lại.");
    },
  });
}

/** Hook xóa job */
export function useDeleteVideoJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVideoJob,
    onSuccess: () => {
      message.success("Đã xóa job");
      qc.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
  });
}

/**
 * Hook lắng nghe Socket.io realtime events từ video-generator namespace
 * Tự động invalidate query khi có job completed/failed
 */
export function useVideoGeneratorSocket() {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "https://api.truyen-tu-ke.io.vn";

    const socket = io(`${socketUrl}/video-generator`, {
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 30000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[VideoGenerator] Socket connected");
    });

    socket.on("video:progress", (data: { jobId: string; progress: number; message: string }) => {
      // Cập nhật progress inline qua optimistic update
      qc.setQueryData([JOBS_KEY], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((j) =>
          j.id === data.jobId ? { ...j, progress: data.progress, status: "processing" } : j
        );
      });
    });

    socket.on("video:completed", (data: { jobId: string; downloadUrl: string; title: string }) => {
      message.success(`✅ Video "${data.title}" đã hoàn thành!`);
      qc.invalidateQueries({ queryKey: [JOBS_KEY] });
    });

    socket.on("video:failed", (data: { jobId: string; error: string; title: string }) => {
      message.error(`❌ Video "${data.title}" thất bại: ${data.error}`);
      qc.invalidateQueries({ queryKey: [JOBS_KEY] });
    });

    return () => {
      socket.disconnect();
    };
  }, [qc]);
}
