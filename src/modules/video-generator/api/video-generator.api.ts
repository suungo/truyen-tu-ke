import { apiClient } from "@/apis";

export interface VideoJob {
  id: string;
  title: string;
  script: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GenerateVideoPayload {
  title: string;
  script: string;
  voice?: string;
  rate?: string;
}

export async function generateVideo(payload: GenerateVideoPayload): Promise<{ jobId: string; status: string }> {
  const res = await apiClient.post("/video-generator/generate", payload);
  return res.data?.data;
}

export async function getVideoJobs(): Promise<VideoJob[]> {
  const res = await apiClient.get("/video-generator/jobs");
  return res.data?.data ?? [];
}

export async function getVideoJob(id: string): Promise<VideoJob> {
  const res = await apiClient.get(`/video-generator/jobs/${id}`);
  return res.data?.data;
}

export async function deleteVideoJob(id: string): Promise<void> {
  await apiClient.delete(`/video-generator/jobs/${id}`);
}

export function getVideoDownloadUrl(id: string): string {
  const base = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "https://api.truyen-tu-ke.io.vn";
  return `${base}/api/v1/video-generator/download/${id}`;
}
