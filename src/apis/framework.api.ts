import { apiClient } from ".";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FrameworkEpisode {
  id: number;
  phaseId: number;
  episodeNumber: number;
  title: string;
  synopsis?: string;
  keyEvents?: string;
  charactersInvolved?: string;
  isCompleted: boolean;
  order: number;
}

export interface FrameworkPhase {
  id: number;
  frameworkId: number;
  title: string;
  description?: string;
  episodeFrom: number;
  episodeTo: number;
  order: number;
  episodes: FrameworkEpisode[];
}

export interface StoryFramework {
  id: number;
  storyId: number;
  story?: { id: number; title: string; author: string; genre?: { name: string } };
  totalEpisodes: number;
  overview?: string;
  phases: FrameworkPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface EpisodePayload {
  episodeNumber: number;
  title: string;
  synopsis?: string;
  keyEvents?: string;
  charactersInvolved?: string;
  isCompleted?: boolean;
  order?: number;
}

export interface PhasePayload {
  title: string;
  description?: string;
  episodeFrom: number;
  episodeTo: number;
  order?: number;
  episodes?: EpisodePayload[];
}

export interface FrameworkPayload {
  totalEpisodes: number;
  overview?: string;
  phases?: PhasePayload[];
}

// ─── Framework API ──────────────────────────────────────────────────────────

export const adminGetAllFrameworks = async (): Promise<StoryFramework[]> => {
  const res = await apiClient.get("/admin/frameworks");
  return res.data.data;
};

export const adminGetFrameworkByStory = async (
  storyId: number
): Promise<StoryFramework | null> => {
  const res = await apiClient.get(`/admin/stories/${storyId}/framework`);
  return res.data.data;
};

export const adminCreateOrUpdateFramework = async (
  storyId: number,
  payload: FrameworkPayload
): Promise<StoryFramework> => {
  const res = await apiClient.post(
    `/admin/stories/${storyId}/framework`,
    payload
  );
  return res.data.data;
};

export const adminUpdateFramework = async (
  frameworkId: number,
  payload: Partial<FrameworkPayload>
): Promise<StoryFramework> => {
  const res = await apiClient.put(`/admin/frameworks/${frameworkId}`, payload);
  return res.data.data;
};

export const adminDeleteFramework = async (frameworkId: number): Promise<void> => {
  await apiClient.delete(`/admin/frameworks/${frameworkId}`);
};

// ─── Phase API ──────────────────────────────────────────────────────────────

export const adminAddPhase = async (
  frameworkId: number,
  payload: PhasePayload
): Promise<FrameworkPhase> => {
  const res = await apiClient.post(
    `/admin/frameworks/${frameworkId}/phases`,
    payload
  );
  return res.data.data;
};

export const adminUpdatePhase = async (
  phaseId: number,
  payload: Partial<PhasePayload>
): Promise<FrameworkPhase> => {
  const res = await apiClient.put(`/admin/phases/${phaseId}`, payload);
  return res.data.data;
};

export const adminDeletePhase = async (phaseId: number): Promise<void> => {
  await apiClient.delete(`/admin/phases/${phaseId}`);
};

// ─── Episode API ─────────────────────────────────────────────────────────────

export const adminAddEpisode = async (
  phaseId: number,
  payload: EpisodePayload
): Promise<FrameworkEpisode> => {
  const res = await apiClient.post(
    `/admin/phases/${phaseId}/episodes`,
    payload
  );
  return res.data.data;
};

export const adminUpdateEpisode = async (
  episodeId: number,
  payload: Partial<EpisodePayload>
): Promise<FrameworkEpisode> => {
  const res = await apiClient.put(`/admin/episodes/${episodeId}`, payload);
  return res.data.data;
};

export const adminToggleEpisodeComplete = async (
  episodeId: number
): Promise<FrameworkEpisode> => {
  const res = await apiClient.patch(`/admin/episodes/${episodeId}/toggle-complete`);
  return res.data.data;
};

export const adminDeleteEpisode = async (episodeId: number): Promise<void> => {
  await apiClient.delete(`/admin/episodes/${episodeId}`);
};
