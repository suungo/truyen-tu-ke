import { Loader2, StopCircle, Volume2 } from "lucide-react";
import type { FptVoice } from "../hook/useFptTTS";
import { FPT_VOICES } from "../hook/useFptTTS";

interface AudioPlayerBarProps {
  speaking: boolean;
  loading: boolean;
  progress: number;
  voice: FptVoice;
  onStop: () => void;
  mode?: "fpt" | "browser";
}

export default function AudioPlayerBar({
  speaking,
  loading,
  progress,
  voice,
  onStop,
  mode = "fpt",
}: AudioPlayerBarProps) {
  const voiceInfo = FPT_VOICES.find((v) => v.value === voice);
  const isBrowser = mode === "browser";

  if (!speaking && !loading) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-[#2D251E] text-[#EEDCBE] rounded-2xl shadow-2xl shadow-black/40 px-5 py-3.5 flex items-center gap-4 border border-white/10 backdrop-blur">
        {/* Icon trạng thái */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-700/30 flex items-center justify-center">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-amber-400" />
          ) : (
            <Volume2 size={18} className="text-amber-400 animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#EEDCBE]/60 mb-0.5">
            {loading ? "Đang tải audio..." : isBrowser ? "Giọng trình duyệt (Dự phòng)" : "Giọng đọc AI (FPT.AI)"}
          </div>
          <div className="text-sm font-black truncate">
            {isBrowser ? "Google Tiếng Việt" : (voiceInfo?.label ?? voice)}
            {!isBrowser && (
              <span className="text-xs font-normal opacity-60 ml-1.5">
                · {voiceInfo?.gender} · {voiceInfo?.region}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Nút dừng */}
        <button
          onClick={onStop}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-700/30 hover:bg-red-700/60 flex items-center justify-center transition-colors cursor-pointer"
          title="Dừng đọc"
        >
          <StopCircle size={18} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
