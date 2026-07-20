import { apiClient } from ".";

export interface Genre {
  id: number;
  name: string;
}

export interface Story {
  id: number;
  title: string;
  author: string;
  description: string;
  characters?: string;
  setting?: string;
  content: string;
  coverImage: string;
  genre?: Genre;
  isApproved?: boolean;
  isRejected?: boolean;
  isReaderStory?: boolean;
  isShortStory?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPayload {
  title: string;
  author: string;
  description?: string;
  characters?: string;
  setting?: string;
  content: string;
  coverImage?: string;
  genreId?: number;
  isShortStory?: boolean;
}

export const adminGetStories = async (): Promise<Story[]> => {
  const res = await apiClient.get("/admin/stories");
  return res.data.data;
};

export const adminGetStats = async (filters?: {
  date?: string;
  month?: string;
  year?: string;
}): Promise<{
  totalStories: number;
  totalReaders: number;
  totalViews: number;
  trafficData: { label: string; visits: number }[];
  hourlyData: { label: string; visits: number }[];
}> => {
  const res = await apiClient.get("/admin/stats", { params: filters });
  return res.data.data;
};

export const adminCreateStory = async (payload: StoryPayload): Promise<Story> => {
  const res = await apiClient.post("/admin/stories", payload);
  return res.data.data;
};

export const adminUpdateStory = async (
  id: number,
  payload: Partial<StoryPayload>
): Promise<Story> => {
  const res = await apiClient.put(`/admin/stories/${id}`, payload);
  return res.data.data;
};

export const adminDeleteStory = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/stories/${id}`);
};

export const adminUploadCover = async (
  id: number,
  file: File
): Promise<Story> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(`/admin/stories/${id}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ─── Admin Genre CRUD ──────────────────────────────────────────────────────

export const adminGetGenres = async (): Promise<Genre[]> => {
  const res = await apiClient.get("/admin/genres");
  return res.data.data;
};

export const adminCreateGenre = async (name: string): Promise<Genre> => {
  const res = await apiClient.post("/admin/genres", { name });
  return res.data.data;
};

export const adminUpdateGenre = async (id: number, name: string): Promise<Genre> => {
  const res = await apiClient.put(`/admin/genres/${id}`, { name });
  return res.data.data;
};

export const adminDeleteGenre = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/genres/${id}`);
};

export const adminGetPendingStories = async (): Promise<Story[]> => {
  const res = await apiClient.get("/admin/stories/pending");
  return res.data.data;
};

export const adminApproveStory = async (id: number): Promise<Story> => {
  const res = await apiClient.patch(`/admin/stories/${id}/approve`);
  return res.data.data;
};

export const adminRejectStory = async (id: number): Promise<Story> => {
  const res = await apiClient.patch(`/admin/stories/${id}/reject`);
  return res.data.data;
};
