import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetAllFrameworks,
  adminGetFrameworkByStory,
  adminCreateOrUpdateFramework,
  adminUpdateFramework,
  adminDeleteFramework,
  adminAddPhase,
  adminUpdatePhase,
  adminDeletePhase,
  adminAddEpisode,
  adminUpdateEpisode,
  adminToggleEpisodeComplete,
  adminDeleteEpisode,
  type FrameworkPayload,
  type PhasePayload,
  type EpisodePayload,
} from "@/apis/framework.api";

const FW_KEY = "admin-frameworks";
const fwStoryKey = (storyId: number) => ["admin-framework-story", storyId];

/** Invalidate cả list lẫn detail theo storyId */
function invalidateAll(qc: ReturnType<typeof useQueryClient>, storyId?: number) {
  qc.invalidateQueries({ queryKey: [FW_KEY] });
  if (storyId) qc.invalidateQueries({ queryKey: fwStoryKey(storyId) });
}

export function useAdminFrameworks() {
  return useQuery({ queryKey: [FW_KEY], queryFn: adminGetAllFrameworks });
}

export function useFrameworkByStory(storyId: number) {
  return useQuery({
    queryKey: fwStoryKey(storyId),
    queryFn: () => adminGetFrameworkByStory(storyId),
    enabled: !!storyId,
  });
}

export function useCreateOrUpdateFramework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, payload }: { storyId: number; payload: FrameworkPayload }) =>
      adminCreateOrUpdateFramework(storyId, payload),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useUpdateFramework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<FrameworkPayload> }) =>
      adminUpdateFramework(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FW_KEY] }),
  });
}

export function useDeleteFramework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteFramework,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FW_KEY] }),
  });
}

export function useAddPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ frameworkId, payload}: { frameworkId: number; payload: PhasePayload; storyId?: number }) =>
      adminAddPhase(frameworkId, payload),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useUpdatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload}: { id: number; payload: Partial<PhasePayload>; storyId?: number }) =>
      adminUpdatePhase(id, payload),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useDeletePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phaseId }: { phaseId: number; storyId?: number }) =>
      adminDeletePhase(phaseId),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useAddEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phaseId, payload }: { phaseId: number; payload: EpisodePayload; storyId?: number }) =>
      adminAddEpisode(phaseId, payload),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useUpdateEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EpisodePayload>; storyId?: number }) =>
      adminUpdateEpisode(id, payload),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useToggleEpisodeComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ episodeId }: { episodeId: number; storyId?: number }) =>
      adminToggleEpisodeComplete(episodeId),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}

export function useDeleteEpisode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ episodeId }: { episodeId: number; storyId?: number }) =>
      adminDeleteEpisode(episodeId),
    onSuccess: (_, vars) => invalidateAll(qc, vars.storyId),
  });
}
