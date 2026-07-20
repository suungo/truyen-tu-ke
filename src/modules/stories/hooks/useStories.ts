import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetStories,
  adminGetStats,
  adminCreateStory,
  adminUpdateStory,
  adminDeleteStory,
  adminUploadCover,
  adminGetGenres,
  adminCreateGenre,
  adminUpdateGenre,
  adminDeleteGenre,
  adminGetPendingStories,
  adminApproveStory,
  adminRejectStory,
  type StoryPayload,
} from "@/apis/stories.api";

export function useAdminStories() {
  return useQuery({
    queryKey: ["admin-stories"],
    queryFn: adminGetStories,
  });
}

export function useAdminStats(filters?: { date?: string; month?: string; year?: string }) {
  return useQuery({
    queryKey: ["admin-stats", filters],
    queryFn: () => adminGetStats(filters),
  });
}

export function useAdminGenres() {
  return useQuery({
    queryKey: ["admin-genres"],
    queryFn: adminGetGenres,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCreateStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<StoryPayload> }) =>
      adminUpdateStory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-stories"] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUploadCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      adminUploadCover(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCreateGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      adminUpdateGenre(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-genres"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-genres"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    },
  });
}

export function useAdminPendingStories() {
  return useQuery({
    queryKey: ["admin-pending-stories"],
    queryFn: adminGetPendingStories,
  });
}

export function useApproveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApproveStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useRejectStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminRejectStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
