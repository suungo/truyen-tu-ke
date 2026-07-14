import { useState } from "react";
import { Modal, Slider } from "antd";
import { Mic2, PlayCircle, Zap } from "lucide-react";
import { FPT_VOICES, type FptVoice } from "../hook/useFptTTS";

interface FptVoiceModalProps {
  open: boolean;
  onCancel: () => void;
  onStart: (voice: FptVoice, speed: number) => void;
}

const SPEED_LABELS: Record<number, string> = {
  [-3]: "Rất chậm",
  [-2]: "Chậm (đọc truyện)",
  [-1]: "Hơi chậm",
  [0]: "Bình thường",
  [1]: "Hơi nhanh",
  [2]: "Nhanh",
  [3]: "Rất nhanh",
};

export default function FptVoiceModal({ open, onCancel, onStart }: FptVoiceModalProps) {
  const [selectedVoice, setSelectedVoice] = useState<FptVoice>("leminh");
  const [speed, setSpeed] = useState<number>(-2);

  const selectedInfo = FPT_VOICES.find((v) => v.value === selectedVoice);

  return (
    <Modal
      title={
        <span className="text-[#2D251E] font-bold text-lg flex items-center gap-2">
          <Mic2 size={20} className="text-orange-600" />
          Tùy chọn giọng đọc FPT.AI
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={460}
      styles={{ body: { padding: "16px 0 0 0" } }}
    >
      <div className="space-y-5">
        {/* Giọng đọc */}
        <div>
          <label className="block text-sm font-bold text-[#2D251E]/70 mb-2.5 uppercase tracking-wide">
            🎙️ Chọn giọng đọc
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FPT_VOICES.map((v) => (
              <button
                key={v.value}
                onClick={() => setSelectedVoice(v.value)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedVoice === v.value
                    ? "border-orange-600 bg-orange-50 text-orange-800"
                    : "border-[#2D251E]/10 bg-white/60 text-[#2D251E]/80 hover:border-[#2D251E]/30 hover:bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    v.gender === "Nam"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {v.gender === "Nam" ? "♂" : "♀"}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight">{v.label}</div>
                  <div className="text-xs opacity-60 leading-tight">{v.region}</div>
                </div>
                {selectedVoice === v.value && (
                  <span className="ml-auto text-orange-600 flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tốc độ đọc */}
        <div>
          <label className="block text-sm font-bold text-[#2D251E]/70 mb-1 uppercase tracking-wide">
            <Zap size={13} className="inline mr-1 text-amber-500" />
            Tốc độ đọc
          </label>
          <div className="text-center text-xs text-orange-700 font-bold mb-2 bg-orange-50 border border-orange-100 rounded-lg py-1">
            {SPEED_LABELS[speed] ?? "Bình thường"}
          </div>
          <Slider
            min={-3}
            max={3}
            step={1}
            value={speed}
            onChange={(val) => setSpeed(val)}
            marks={{
              [-3]: "Rất chậm",
              [0]: "Vừa",
              [3]: "Nhanh",
            }}
            tooltip={{ formatter: (val) => SPEED_LABELS[val!] ?? val }}
            styles={{
              track: { background: "#c2410c" },
              rail: { background: "#e7c4a0" },
            }}
          />
        </div>

        {/* Preview selected */}
        {selectedInfo && (
          <div className="bg-[#F5EAD4] border border-[#2D251E]/10 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                selectedInfo.gender === "Nam"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {selectedInfo.gender === "Nam" ? "♂" : "♀"}
            </div>
            <div>
              <div className="font-bold text-[#2D251E]">{selectedInfo.label}</div>
              <div className="text-xs text-[#2D251E]/60">
                {selectedInfo.gender} · {selectedInfo.region} · Tốc độ: {SPEED_LABELS[speed]}
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-xs text-[#2D251E]/50 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          💡 Giọng FPT.AI sẽ tải từng đoạn khoảng 1–2 giây trước khi phát. Đây là giọng AI chuyên nghiệp, không phải giọng trình duyệt.
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-3 border-t border-[#2D251E]/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#2D251E]/20 text-[#2D251E]/80 text-sm font-semibold hover:bg-[#2D251E]/5 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => onStart(selectedVoice, speed)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2D251E] hover:bg-orange-700 text-[#EEDCBE] hover:text-white text-sm font-black transition-colors cursor-pointer shadow-md"
          >
            <PlayCircle size={16} />
            Bắt đầu nghe
          </button>
        </div>
      </div>
    </Modal>
  );
}
