import { type Story } from "@/apis/stories.api";
import { Eye, BookOpen } from "lucide-react";
import { useChaptersQuery, useStoryFrameworkQuery } from "../hooks/useStories";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const normalizeText = (text?: string) => {
  if (!text) return "";
  return text.normalize("NFC");
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const fallback =
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80";

  const { data: chaptersData } = useChaptersQuery(story.id);
  const { data: framework } = useStoryFrameworkQuery(story.id);

  const publishedCount = chaptersData?.total || 0;
  const expectedCount = framework?.totalEpisodes || 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-[#2D251E]/5 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={story.coverImage || fallback}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Chapter counter overlay badge */}
        {!story.isShortStory && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <BookOpen size={10} />
            <span>
              {publishedCount}/{expectedCount || "?"} tập
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#2D251E] text-base line-clamp-2 mb-1 group-hover:text-[#C2410C] transition-colors">
          {normalizeText(story.title)}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#2D251E]/60">✍️ {normalizeText(story.author)}</p>
          {story.isShortStory ? (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
              Truyện ngắn
            </span>
          ) : expectedCount > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
              {publishedCount >= expectedCount ? "Đã hoàn thành" : "Đang ra"}
            </span>
          )}
        </div>
        {story.description && (
          <p className="text-sm text-[#2D251E]/75 line-clamp-2 min-h-[40px]">
            {normalizeText(story.description)}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#2D251E]/40">
            <span>
              {new Date(story.createdAt).toLocaleDateString("vi-VN")}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Eye size={14} className="opacity-80" />
              {story.views ?? 0}
            </span>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-colors"
            style={{
              background: "#C2410C",
            }}
          >
            Đọc ngay →
          </span>
        </div>
      </div>
    </div>
  );
}
