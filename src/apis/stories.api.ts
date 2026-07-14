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
  coverImage: string;
  genre?: Genre;
  content?: string;
  isApproved?: boolean;
  isReaderStory?: boolean;
  isShortStory?: boolean;
  views?: number;
  createdAt: string;
}

export const getStories = async (params?: {
  page?: number;
  limit?: number;
  genreId?: number | null;
  search?: string;
}): Promise<{ stories: Story[]; total: number }> => {
  const res = await apiClient.get("/stories", { params });
  return res.data.data;
};

export const getStoryById = async (id: number): Promise<Story> => {
  const res = await apiClient.get(`/stories/${id}`);
  return res.data.data;
};

export const getGenres = async (params?: { hasStories?: boolean }): Promise<Genre[]> => {
  const res = await apiClient.get("/genres", { params });
  return res.data.data;
};

export const logVisit = async (): Promise<void> => {
  await apiClient.post("/stories/visit");
};

export const registerStory = async (dto: any): Promise<any> => {
  const res = await apiClient.post("/stories/register", dto);
  return res.data.data;
};

export const getReaderStoryHistory = async (author: string): Promise<Story[]> => {
  const res = await apiClient.get("/stories/history", { params: { author } });
  return res.data.data;
};

export const updateRegisteredStory = async (
  id: number,
  dto: any
): Promise<Story> => {
  const res = await apiClient.put(`/stories/register/${id}`, dto);
  return res.data.data;
};

export const getChapters = async (
  storyId: number
): Promise<{ chapters: any[]; total: number }> => {
  const res = await apiClient.get(`/stories/${storyId}/chapters`);
  return res.data.data;
};

export const getChapterDetail = async (
  storyId: number,
  chapterNumber: number
): Promise<any> => {
  const res = await apiClient.get(`/stories/${storyId}/chapters/${chapterNumber}`);
  return res.data.data;
};

export const getStoryFramework = async (
  storyId: number
): Promise<any> => {
  const res = await apiClient.get(`/stories/${storyId}/framework`);
  return res.data.data;
};
