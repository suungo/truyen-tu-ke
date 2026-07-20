import { apiClient } from ".";

export interface Chapter {
  id: number;
  storyId: number;
  chapterNumber: number;
  title: string;
  synopsis?: string;
  content?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterPayload {
  chapterNumber: number;
  title: string;
  content: string;
  synopsis?: string;
}

export const adminGetChapters = async (storyId: number): Promise<{ chapters: Chapter[]; total: number }> => {
  const res = await apiClient.get(`/admin/stories/${storyId}/chapters`);
  return res.data.data;
};

export const adminGetChapter = async (storyId: number, chapterNumber: number): Promise<Chapter> => {
  const res = await apiClient.get(`/admin/stories/${storyId}/chapters/${chapterNumber}`);
  return res.data.data;
};

export const adminCreateChapter = async (storyId: number, payload: ChapterPayload): Promise<Chapter> => {
  const res = await apiClient.post(`/admin/stories/${storyId}/chapters`, payload);
  return res.data.data;
};

export const adminUpdateChapter = async (
  storyId: number,
  chapterNumber: number,
  payload: Partial<ChapterPayload>
): Promise<Chapter> => {
  const res = await apiClient.put(`/admin/stories/${storyId}/chapters/${chapterNumber}`, payload);
  return res.data.data;
};

export const adminDeleteChapter = async (storyId: number, chapterNumber: number): Promise<void> => {
  await apiClient.delete(`/admin/stories/${storyId}/chapters/${chapterNumber}`);
};
