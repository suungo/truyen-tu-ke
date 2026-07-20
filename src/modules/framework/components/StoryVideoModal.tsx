import { useState, useRef, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Slider,
  Select,
  Switch,
  Input,
  message,
  Progress,
  Spin,
  Alert,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { Chapter } from "@/apis/chapters.api";
import { adminGetChapter } from "@/apis/chapters.api";

interface Props {
  open: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  storyTitle: string;
  coverImage?: string;
}

const GEMINI_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ─── Canvas renderer ────────────────────────────────────────────────────────
const BG_PRESETS = [
  { label: "Tím huyền bí", value: "purple", from: "#1a0533", to: "#3b1060" },
  { label: "Xanh đại dương", value: "blue", from: "#020b18", to: "#0d3b6e" },
  { label: "Đỏ lửa", value: "red", from: "#1a0000", to: "#5c1010" },
  { label: "Vàng cổ điển", value: "gold", from: "#1a1000", to: "#4a3000" },
  { label: "Đen hiện đại", value: "black", from: "#0a0a0a", to: "#1e1e1e" },
];

const FONT_PRESETS = [
  { label: "Serif cổ điển", value: "Georgia, serif" },
  { label: "Sans hiện đại", value: "Inter, sans-serif" },
  { label: "Mono", value: "monospace" },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  maxWidth: number,
  lineHeight: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  paragraph: string,
  chapterTitle: string,
  storyTitle: string,
  bgPreset: (typeof BG_PRESETS)[0],
  fontFamily: string,
  progress: number, // 0–1
  alpha: number, // fade in/out
) {
  const W = canvas.width;
  const H = canvas.height;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bgPreset.from);
  grad.addColorStop(1, bgPreset.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative orbs
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.15, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.1, H * 0.85, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Side accent line
  ctx.save();
  ctx.globalAlpha = 0.35;
  const lineGrad = ctx.createLinearGradient(0, H * 0.2, 0, H * 0.8);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, "#a78bfa");
  lineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(36, H * 0.2, 3, H * 0.6);
  ctx.restore();

  // Story title (top)
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.font = `600 13px ${fontFamily}`;
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(storyTitle.toUpperCase(), 56, 42);
  ctx.restore();

  // Chapter title
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.font = `bold 22px ${fontFamily}`;
  ctx.fillStyle = "#f3e8ff";
  ctx.fillText(chapterTitle, 56, 80);
  ctx.restore();

  // Separator line
  ctx.save();
  ctx.globalAlpha = alpha * 0.4;
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(56, 95);
  ctx.lineTo(W - 56, 95);
  ctx.stroke();
  ctx.restore();

  // Main paragraph text
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `18px ${fontFamily}`;
  ctx.fillStyle = "#f0e6ff";
  const lines = wrapText(ctx, paragraph, 56, W - 112, 32);
  const totalTextH = lines.length * 32;
  const startY = H / 2 - totalTextH / 2 + 30;
  lines.forEach((line, i) => {
    ctx.fillText(line, 56, startY + i * 32);
  });
  ctx.restore();

  // Progress bar
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(56, H - 30, W - 112, 4, 2);
  ctx.fill();

  ctx.globalAlpha = 0.85;
  const barGrad = ctx.createLinearGradient(56, 0, 56 + (W - 112) * progress, 0);
  barGrad.addColorStop(0, "#7c3aed");
  barGrad.addColorStop(1, "#34d399");
  ctx.fillStyle = barGrad;
  ctx.beginPath();
  ctx.roundRect(56, H - 30, (W - 112) * progress, 4, 2);
  ctx.fill();
  ctx.restore();

  // Watermark
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.font = `11px ${fontFamily}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("✦ Truyện Tự Kể", W - 130, H - 14);
  ctx.restore();
}

// ─── Split text into paragraphs ─────────────────────────────────────────────
function splitIntoParagraphs(text: string, maxChars = 120): string[] {
  const rawParagraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const result: string[] = [];
  for (const para of rawParagraphs) {
    if (para.length <= maxChars) {
      result.push(para);
    } else {
      // Split long paragraphs into sentences
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      let chunk = "";
      for (const s of sentences) {
        if ((chunk + s).length > maxChars && chunk) {
          result.push(chunk.trim());
          chunk = s;
        } else {
          chunk += " " + s;
        }
      }
      if (chunk.trim()) result.push(chunk.trim());
    }
  }
  return result.filter(Boolean);
}

// ─── Main Component ────────────────────────────────────────────────────────────────────────────
export default function StoryVideoModal({
  open,
  onClose,
  chapter,
  storyTitle,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animFrameRef = useRef<number>(0);
  const isRecordingRef = useRef(false);

  // Full chapter content fetched separately (list API omits content)
  const [fullContent, setFullContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "summarizing" | "recording" | "done" | "error"
  >("idle");
  const [recordProgress, setRecordProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [, setParagraphs] = useState<string[]>([]);
  const [currentPara, setCurrentPara] = useState(0);
  const [totalParas, setTotalParas] = useState(0);

  // Settings
  const [apiKey, setApiKey] = useState(
    () =>
      import.meta.env.VITE_GEMINI_API_KEY?.trim() ||
      localStorage.getItem("gemini_api_key") ||
      "",
  );
  const [useGemini, setUseGemini] = useState(false);
  const [bgPreset, setBgPreset] = useState(BG_PRESETS[0]);
  const [fontFamily, setFontFamily] = useState(FONT_PRESETS[0].value);
  const [speechRate, setSpeechRate] = useState(0.85);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        const vi = v.find(
          (x) => x.lang.startsWith("vi") || x.name.toLowerCase().includes("vi"),
        );
        if (vi) setSelectedVoice(vi.name);
        else setSelectedVoice(v[0]?.name || "");
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Fetch full chapter content when modal opens
  useEffect(() => {
    if (!open || !chapter) {
      setFullContent("");
      return;
    }
    // If content already available (e.g. from edit modal), use it directly
    if (chapter.content && chapter.content.trim().length > 0) {
      setFullContent(chapter.content);
      return;
    }
    // Otherwise fetch from API
    setLoadingContent(true);
    adminGetChapter(chapter.storyId, chapter.chapterNumber)
      .then((ch) => {
        setFullContent(ch.content || "");
      })
      .catch(() => {
        message.error("Không thể tải nội dung tập");
      })
      .finally(() => setLoadingContent(false));
  }, [open, chapter]);

  // Draw idle frame on canvas when opened
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    drawFrame(
      ctx,
      canvasRef.current,
      'Nhấn "Tạo Video" để bắt đầu...',
      chapter?.title || "",
      storyTitle,
      bgPreset,
      fontFamily,
      0,
      1,
    );
  }, [open, bgPreset, fontFamily, chapter, storyTitle]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) localStorage.setItem("gemini_api_key", key);
  };

  // ── Gemini summarize ──────────────────────────────────────────────────────
  const summarizeWithGemini = async (content: string): Promise<string> => {
    const prompt = `Tóm tắt đoạn truyện sau thành các đoạn ngắn gọn, súc tích, giữ nguyên cảm xúc và các tình tiết quan trọng. Mỗi đoạn không quá 2 câu. Viết bằng tiếng Việt, không thêm tiêu đề hay số thứ tự:\n\n${content.substring(0, 4000)}`;

    const res = await fetch(`${GEMINI_URL("gemini-1.5-flash")}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) throw new Error("Gemini API lỗi");
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || content;
  };

  // ── Main: generate video ──────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!chapter || !canvasRef.current) return;
    speechSynthesis.cancel();

    setStatus("idle");
    setVideoUrl(null);
    setRecordProgress(0);
    setCurrentPara(0);

    try {
      // Step 1: get/summarize text — use fullContent fetched from API
      let text = fullContent;
      if (!text.trim()) {
        message.error("Tập này chưa có nội dung!");
        return;
      }

      if (useGemini) {
        if (!apiKey.trim()) {
          message.error("Vui lòng nhập Gemini API Key");
          return;
        }
        setStatus("summarizing");
        text = await summarizeWithGemini(text);
      }

      const paras = splitIntoParagraphs(text, 130);
      if (!paras.length) {
        message.error("Không thể xử lý nội dung");
        return;
      }
      setParagraphs(paras);
      setTotalParas(paras.length);

      // Step 2: setup MediaRecorder
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stream = canvas.captureStream(30);
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      });
      mediaRecorderRef.current = recorder;
      isRecordingRef.current = true;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus("done");
        setRecordProgress(100);
      };

      recorder.start(200);
      setStatus("recording");

      // Step 3: iterate paragraphs with TTS
      for (let i = 0; i < paras.length; i++) {
        if (!isRecordingRef.current) break;
        setCurrentPara(i + 1);
        setRecordProgress(Math.round(((i + 1) / paras.length) * 95));

        await new Promise<void>((resolve) => {
          const para = paras[i];
          let startTime = performance.now();
          let duration = 4000; // default 4s if TTS not speaking

          const utt = new SpeechSynthesisUtterance(para);
          utt.lang = "vi-VN";
          utt.rate = speechRate;
          utt.pitch = speechPitch;
          const voice = voices.find((v) => v.name === selectedVoice);
          if (voice) utt.voice = voice;

          synthRef.current = utt;

          // estimate duration from TTS boundary events
          utt.onboundary = (ev) => {
            if (ev.name === "sentence") duration = ev.elapsedTime || duration;
          };

          utt.onstart = () => {
            startTime = performance.now();
          };

          utt.onend = () => {
            duration = performance.now() - startTime;
            // Extra pause after paragraph
            setTimeout(resolve, 300);
          };

          utt.onerror = () => resolve();

          // Animation loop for this paragraph
          // const totalFrames = Math.ceil(duration / 33);
          let frame = 0;

          const animate = () => {
            if (!isRecordingRef.current) {
              resolve();
              return;
            }
            frame++;
            const elapsed = performance.now() - startTime;
            const paraProgress = Math.min(
              elapsed / Math.max(duration, 1000),
              1,
            );
            const globalProgress = (i + paraProgress) / paras.length;

            // fade in first 0.3s, fade out last 0.3s
            const fadeDuration = 300;
            let alpha = 1;
            if (elapsed < fadeDuration) alpha = elapsed / fadeDuration;
            else if (elapsed > duration - fadeDuration)
              alpha = (duration - elapsed) / fadeDuration;
            alpha = Math.max(0, Math.min(1, alpha));

            drawFrame(
              ctx,
              canvas,
              para,
              `Tập ${chapter.chapterNumber}: ${chapter.title}`,
              storyTitle,
              bgPreset,
              fontFamily,
              globalProgress,
              alpha,
            );

            if (elapsed < duration + 300 && isRecordingRef.current) {
              animFrameRef.current = requestAnimationFrame(animate);
            }
          };

          animFrameRef.current = requestAnimationFrame(animate);
          speechSynthesis.speak(utt);
        });

        // Brief black frame between paragraphs
        if (i < paras.length - 1 && isRecordingRef.current) {
          await new Promise<void>((resolve) => {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setTimeout(resolve, 200);
          });
        }
      }

      // Final frame
      if (isRecordingRef.current) {
        drawFrame(
          ctx,
          canvas,
          "~ Hết tập ~",
          `Tập ${chapter.chapterNumber}: ${chapter.title}`,
          storyTitle,
          bgPreset,
          fontFamily,
          1,
          1,
        );
        await new Promise((r) => setTimeout(r, 1500));
        recorder.stop();
      }
    } catch (err: any) {
      setStatus("error");
      message.error(err.message || "Có lỗi xảy ra khi tạo video");
    }
  }, [
    chapter,
    storyTitle,
    useGemini,
    apiKey,
    bgPreset,
    fontFamily,
    speechRate,
    speechPitch,
    selectedVoice,
    voices,
  ]);

  const handleStop = () => {
    isRecordingRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    speechSynthesis.cancel();
    mediaRecorderRef.current?.stop();
  };

  const handleClose = () => {
    handleStop();
    setStatus("idle");
    setVideoUrl(null);
    setRecordProgress(0);
    setParagraphs([]);
    setCurrentPara(0);
    onClose();
  };

  const handleDownload = () => {
    if (!videoUrl || !chapter) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `tap-${chapter.chapterNumber}-${chapter.title.replace(/\s+/g, "-")}.webm`;
    a.click();
  };

  const isRunning = status === "recording" || status === "summarizing";

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <VideoCameraOutlined className="text-purple-600" />
          <span className="font-bold text-gray-800">
            Tạo Video — Tập {chapter?.chapterNumber}: {chapter?.title}
          </span>
        </div>
      }
      width={920}
      footer={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex gap-0" style={{ minHeight: 540 }}>
        {/* ── Left: Settings ─────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 border-r border-gray-100 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-50/40">
          {/* Use Gemini */}
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                ✨ Tóm tắt bằng AI
              </span>
              <Switch
                size="small"
                checked={useGemini}
                onChange={setUseGemini}
                style={useGemini ? { background: "#7c3aed" } : {}}
              />
            </div>
            <p className="text-[10px] text-purple-500 leading-relaxed">
              Dùng Gemini để tóm tắt nội dung dài thành các đoạn ngắn hơn trước
              khi đọc
            </p>
            {useGemini && (
              <div className="mt-2">
                <Input.Password
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  size="small"
                  className="rounded-lg"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Key lưu trong trình duyệt. Lấy tại{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    aistudio.google.com
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Background */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              🎨 Nền video
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setBgPreset(preset)}
                  title={preset.label}
                  className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                    bgPreset.value === preset.value
                      ? "border-purple-500 scale-110"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              🔤 Font chữ
            </label>
            <Select
              value={fontFamily}
              onChange={setFontFamily}
              className="w-full"
              size="small"
              options={FONT_PRESETS.map((f) => ({
                label: f.label,
                value: f.value,
              }))}
            />
          </div>

          {/* TTS settings */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
              <SoundOutlined className="mr-1" />
              Giọng đọc
            </label>
            <Select
              value={selectedVoice}
              onChange={setSelectedVoice}
              className="w-full mb-2"
              size="small"
              showSearch
              placeholder="Chọn giọng đọc"
              options={voices.map((v) => ({
                label: `${v.name} (${v.lang})`,
                value: v.name,
              }))}
            />
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Tốc độ
                  </span>
                  <span className="text-[10px] font-bold text-purple-600">
                    {speechRate}x
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={speechRate}
                  onChange={setSpeechRate}
                  tooltip={{ formatter: (v) => `${v}x` }}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Cao độ
                  </span>
                  <span className="text-[10px] font-bold text-purple-600">
                    {speechPitch}
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={speechPitch}
                  onChange={setSpeechPitch}
                />
              </div>
            </div>
          </div>

          {/* Chapter info */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs space-y-1">
            <p className="font-bold text-blue-700 uppercase text-[10px] tracking-wide mb-1">
              📋 Thông tin tập
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Truyện:</span> {storyTitle}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Tập:</span>{" "}
              {chapter?.chapterNumber}
            </p>
            <p className="text-gray-600 line-clamp-2">
              <span className="font-semibold">Tên:</span> {chapter?.title}
            </p>
            <span className="text-gray-600">
              <span className="font-semibold">Số từ:</span> ~
              {fullContent.split(/\s+/).filter(Boolean).length || 0} từ
            </span>
          </div>
        </div>

        {/* ── Right: Canvas preview + controls ───────────────────────────── */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-black/90 p-4">
            <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <canvas
                ref={canvasRef}
                width={720}
                height={405}
                className="block"
                style={{ maxWidth: "100%", maxHeight: 360 }}
              />
              {(status === "summarizing" || loadingContent) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 32, color: "#a78bfa" }}
                        spin
                      />
                    }
                  />
                  <p className="text-white text-sm font-medium">
                    {loadingContent
                      ? "Đang tải nội dung tập..."
                      : "Gemini đang tóm tắt nội dung..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {status === "recording" && (
            <div className="px-5 pt-3 pb-1 bg-white border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600">
                  🎬 Đang ghi hình...
                </span>
                <span className="text-xs text-purple-600 font-bold">
                  Đoạn {currentPara}/{totalParas}
                </span>
              </div>
              <Progress
                percent={recordProgress}
                strokeColor={{ "0%": "#7c3aed", "100%": "#34d399" }}
                showInfo={false}
                strokeWidth={6}
              />
            </div>
          )}

          {status === "done" && videoUrl && (
            <div className="px-5 pt-3 pb-2 bg-white border-t border-gray-100">
              <Alert
                type="success"
                message="✅ Video đã được tạo thành công!"
                description="Nhấn 'Tải về' để lưu file video .webm về máy của bạn."
                showIcon
                className="mb-2 text-xs"
              />
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg border border-gray-200"
                style={{ maxHeight: 80 }}
              />
            </div>
          )}

          {status === "error" && (
            <div className="px-5 pt-3 pb-2 bg-white border-t border-gray-100">
              <Alert
                type="error"
                message="Có lỗi xảy ra khi tạo video. Vui lòng thử lại."
                showIcon
              />
            </div>
          )}

          {/* Actions */}
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3">
            <Button onClick={handleClose} className="rounded-lg">
              Đóng
            </Button>

            <div className="flex gap-2">
              {status === "done" && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setStatus("idle");
                    setVideoUrl(null);
                    setRecordProgress(0);
                  }}
                  className="rounded-lg"
                >
                  Tạo lại
                </Button>
              )}

              {isRunning ? (
                <Button
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={handleStop}
                  className="rounded-lg font-semibold"
                >
                  Dừng lại
                </Button>
              ) : status === "done" && videoUrl ? (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  size="large"
                  style={{ background: "#0d9488", borderColor: "#0d9488" }}
                  className="rounded-xl font-semibold"
                >
                  Tải video về
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={
                    status === "idle" ? (
                      <PlayCircleOutlined />
                    ) : (
                      <ThunderboltOutlined />
                    )
                  }
                  onClick={handleGenerate}
                  disabled={loadingContent || !fullContent}
                  size="large"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "none",
                  }}
                  className="rounded-xl px-6 font-semibold shadow-md"
                >
                  {loadingContent ? "Đang tải nội dung..." : "🎬 Tạo Video"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
