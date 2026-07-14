import { Volume2, Square } from "lucide-react";

interface StoryHeaderProps {
  author: string;
  createdAt: string;
  speaking: boolean;
  onPlayAudio: () => void;
}

export default function StoryHeader({
  author,
  createdAt,
  speaking,
  onPlayAudio,
}: StoryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 text-sm text-[#2D251E]/50">
      <div className="flex items-center gap-4">
        <span>{author}</span>
        <span>·</span>
        <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>
      </div>

      <button
        onClick={onPlayAudio}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2D3D] text-white hover:bg-[#2c3d50] transition-colors cursor-pointer text-xs font-semibold shadow-xs"
      >
        {speaking ? (
          <>
            <Square size={14} className="animate-pulse text-red-400" />
            <span>Dừng đọc</span>
          </>
        ) : (
          <>
            <Volume2 size={14} />
            <span>Đọc truyện</span>
          </>
        )}
      </button>
    </div>
  );
}
