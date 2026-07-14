import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getStories,
  getGenres,
  getStoryById,
  registerStory,
  getReaderStoryHistory,
  updateRegisteredStory,
  getChapters,
  getStoryFramework,
} from "@/apis/stories.api";

export function useStoriesQuery(params?: {
  page?: number;
  limit?: number;
  genreId?: number | null;
  search?: string;
}) {
  return useQuery({
    queryKey: ["stories", params],
    queryFn: () => getStories(params),
    placeholderData: keepPreviousData,
  });
}

export function useGenresQuery() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => getGenres({ hasStories: true }),
  });
}

export function useStoryDetailQuery(id: number) {
  return useQuery({
    queryKey: ["story", id],
    queryFn: () => getStoryById(id),
    enabled: !!id,
  });
}

export function useRegisterStoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["reader-story-history"] });
    },
  });
}

export function useReaderStoryHistoryQuery(author: string) {
  return useQuery({
    queryKey: ["reader-story-history", author],
    queryFn: () => getReaderStoryHistory(author),
    enabled: !!author,
  });
}

export function useUpdateRegisteredStoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) =>
      updateRegisteredStory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["reader-story-history"] });
    },
  });
}

export function useChaptersQuery(storyId: number) {
  return useQuery({
    queryKey: ["chapters", storyId],
    queryFn: () => getChapters(storyId),
    enabled: !!storyId,
  });
}

export function useStoryFrameworkQuery(storyId: number) {
  return useQuery({
    queryKey: ["framework", storyId],
    queryFn: () => getStoryFramework(storyId),
    enabled: !!storyId,
  });
}
