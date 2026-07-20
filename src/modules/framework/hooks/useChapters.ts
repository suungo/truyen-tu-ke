import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetChapters,
  adminGetChapter,
  adminCreateChapter,
  adminUpdateChapter,
  adminDeleteChapter,
  type ChapterPayload,
} from "@/apis/chapters.api";

const chaptersKey = (storyId: number) => ["admin-chapters", storyId];
const chapterKey = (storyId: number, num: number) => ["admin-chapter", storyId, num];

export function useChaptersByStory(storyId: number) {
  return useQuery({
    queryKey: chaptersKey(storyId),
    queryFn: () => adminGetChapters(storyId),
    enabled: !!storyId,
  });
}

export function useChapter(storyId: number, chapterNumber: number) {
  return useQuery({
    queryKey: chapterKey(storyId, chapterNumber),
    queryFn: () => adminGetChapter(storyId, chapterNumber),
    enabled: !!storyId && !!chapterNumber,
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, payload }: { storyId: number; payload: ChapterPayload }) =>
      adminCreateChapter(storyId, payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: chaptersKey(vars.storyId) }),
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, chapterNumber, payload }: { storyId: number; chapterNumber: number; payload: Partial<ChapterPayload> }) =>
      adminUpdateChapter(storyId, chapterNumber, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: chaptersKey(vars.storyId) });
      qc.invalidateQueries({ queryKey: chapterKey(vars.storyId, vars.chapterNumber) });
    },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, chapterNumber }: { storyId: number; chapterNumber: number }) =>
      adminDeleteChapter(storyId, chapterNumber),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: chaptersKey(vars.storyId) }),
  });
}
