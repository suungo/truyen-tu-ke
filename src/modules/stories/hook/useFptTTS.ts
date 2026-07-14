import { useRef, useState, useCallback } from "react";

export type FptVoice =
  | "leminh"     // Nam - Miền Bắc, trầm ấm
  | "banmai"     // Nữ - Miền Bắc, nhẹ nhàng
  | "lannhi"     // Nữ - Miền Bắc, trẻ trung
  | "minhquang"  // Nam - Miền Nam, trầm
  | "linhsan"    // Nữ - Miền Nam
  | "giahuy"     // Nam - Miền Nam
  | "ngoclam"    // Nữ - Miền Trung
  | "minhtin";   // Nam - Miền Trung

export const FPT_VOICES: { value: FptVoice; label: string; gender: "Nam" | "Nữ"; region: string }[] = [
  { value: "leminh",    label: "Lê Minh",    gender: "Nam", region: "Miền Bắc" },
  { value: "banmai",    label: "Ban Mai",     gender: "Nữ",  region: "Miền Bắc" },
  { value: "lannhi",    label: "Lan Nhi",     gender: "Nữ",  region: "Miền Bắc" },
  { value: "minhquang", label: "Minh Quang",  gender: "Nam", region: "Miền Nam" },
  { value: "linhsan",   label: "Linh San",    gender: "Nữ",  region: "Miền Nam" },
  { value: "giahuy",    label: "Gia Huy",     gender: "Nam", region: "Miền Nam" },
  { value: "ngoclam",   label: "Ngọc Lam",    gender: "Nữ",  region: "Miền Trung" },
  { value: "minhtin",   label: "Minh Tín",    gender: "Nam", region: "Miền Trung" },
];

export type TtsMode = "fpt" | "browser";

/** Chia text thành đoạn <= maxLen ký tự, tách theo câu */
function splitTextIntoChunks(text: string, maxLen = 900): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]?|[^.!?\n]+/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ─── Web Speech API fallback ─────────────────────────────────────────────────

function speakWithBrowser(
  chunks: string[],
  index: number,
  rate: number,
  onEnd: () => void,
  utteranceRef: React.MutableRefObject<SpeechSynthesisUtterance | null>,
  abortedRef: React.MutableRefObject<boolean>
) {
  if (abortedRef.current || index >= chunks.length) {
    onEnd();
    return;
  }
  const utt = new SpeechSynthesisUtterance(chunks[index]);
  utteranceRef.current = utt;

  // Tìm giọng tiếng Việt nếu có
  const viVoice = window.speechSynthesis.getVoices().find(
    (v) => v.lang.startsWith("vi")
  );
  if (viVoice) utt.voice = viVoice;
  utt.lang = "vi-VN";
  utt.rate = rate;
  utt.pitch = 0.95;

  utt.onend = () => {
    speakWithBrowser(chunks, index + 1, rate, onEnd, utteranceRef, abortedRef);
  };
  utt.onerror = (e) => {
    if (e.error !== "interrupted") onEnd();
  };

  window.speechSynthesis.speak(utt);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseFptTTSOptions {
  apiKey: string;
}

export function useFptTTS({ apiKey }: UseFptTTSOptions) {
  const [speaking, setSpeaking]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [mode, setMode]           = useState<TtsMode>("fpt");
  const [error, setError]         = useState<string | null>(null);

  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef       = useRef<string[]>([]);
  const chunkIndexRef   = useRef(0);
  const voiceRef        = useRef<FptVoice>("leminh");
  const speedRef        = useRef<number>(-2);
  const abortedRef      = useRef(false);

  // ── Stop everything ──────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    abortedRef.current = true;

    // Stop FPT audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    // Stop browser TTS
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }

    setSpeaking(false);
    setLoading(false);
    setProgress(0);
    chunksRef.current = [];
    chunkIndexRef.current = 0;
  }, []);

  // ── Browser fallback ─────────────────────────────────────────────────────
  const speakWithBrowserFallback = useCallback((text: string, speed: number) => {
    const chunks = splitTextIntoChunks(text, 200); // browser TTS chunk nhỏ hơn
    setMode("browser");
    setSpeaking(true);
    setLoading(false);

    // Tốc độ browser: -3→0.6, -2→0.75, -1→0.85, 0→1, 1→1.15, 2→1.3, 3→1.5
    const rateMap: Record<number, number> = {
      [-3]: 0.6, [-2]: 0.75, [-1]: 0.85,
      [0]: 1.0,  [1]: 1.15,  [2]: 1.3, [3]: 1.5,
    };
    const browserRate = rateMap[speed] ?? 0.85;

    speakWithBrowser(chunks, 0, browserRate, () => {
      if (!abortedRef.current) {
        setSpeaking(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 1500);
      }
    }, utteranceRef, abortedRef);
  }, []);

  // ── FPT chunk fetch + play ────────────────────────────────────────────────
  const fetchAndPlayChunk = useCallback(
    async (
      chunk: string,
      chunkIndex: number,
      total: number,
      fullText: string,
      speed: number
    ): Promise<void> => {
      if (abortedRef.current) return;

      try {
        setLoading(true);

        const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "speed": String(speedRef.current),
            "voice": voiceRef.current,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: chunk,
        });

        // ── Quota/Auth lỗi → fallback browser ──────────────────────────────
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          console.warn(`[FPT TTS] Lỗi ${response.status} → fallback Browser TTS`);
          setError(`FPT.AI hết quota hoặc lỗi xác thực (${response.status}). Đang dùng giọng trình duyệt thay thế.`);
          speakWithBrowserFallback(fullText, speed);
          return;
        }

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`FPT TTS lỗi ${response.status}: ${errText}`);
        }

        const data = await response.json();

        // FPT.AI trả về { error: 0, async: "https://...mp3" }
        if (data?.error !== 0) {
          // Lỗi quota từ response body
          const msg = data?.message || JSON.stringify(data);
          if (msg?.toLowerCase().includes("limit") || msg?.toLowerCase().includes("quota")) {
            console.warn("[FPT TTS] Hết quota →  fallback Browser TTS");
            setError("FPT.AI hết quota hôm nay. Đang dùng giọng trình duyệt thay thế.");
            speakWithBrowserFallback(fullText, speed);
            return;
          }
          throw new Error(`FPT API error: ${msg}`);
        }

        const audioUrl: string = data?.async;
        if (!audioUrl) throw new Error("Không nhận được URL audio từ FPT.AI");

        if (abortedRef.current) return;

        // Chờ FPT render xong audio (~2 giây)
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        if (abortedRef.current) return;

        setLoading(false);
        setMode("fpt");
        setSpeaking(true);
        setProgress(Math.round(((chunkIndex + 1) / total) * 100));

        await new Promise<void>((resolve) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => {
            // Audio lỗi sau 1 retry → resolve (không dừng toàn bộ)
            setTimeout(() => {
              const retry = new Audio(audioUrl);
              audioRef.current = retry;
              retry.onended = () => resolve();
              retry.onerror = () => resolve(); // bỏ qua chunk lỗi
              retry.play().catch(() => resolve());
            }, 1000);
          };
          audio.play().catch(() => {
            setTimeout(() => audio.play().catch(() => resolve()), 500);
          });
        });

        if (abortedRef.current) return;

        // Next chunk
        chunkIndexRef.current = chunkIndex + 1;
        if (chunkIndexRef.current < chunksRef.current.length) {
          await fetchAndPlayChunk(
            chunksRef.current[chunkIndexRef.current],
            chunkIndexRef.current,
            total,
            fullText,
            speed
          );
        } else {
          setSpeaking(false);
          setProgress(100);
          setTimeout(() => setProgress(0), 1500);
        }

      } catch (err: any) {
        if (!abortedRef.current) {
          console.warn("[FPT TTS] Lỗi → fallback Browser TTS:", err);
          setError("FPT.AI gặp lỗi. Đang dùng giọng trình duyệt thay thế.");
          speakWithBrowserFallback(fullText, speed);
        }
      }
    },
    [apiKey, speakWithBrowserFallback]
  );

  // ── Public speak ─────────────────────────────────────────────────────────
  const speak = useCallback(
    async (text: string, voice: FptVoice, speed: number) => {
      stopAudio();

      setTimeout(async () => {
        abortedRef.current = false;
        setError(null);

        const chunks = splitTextIntoChunks(text, 900);
        if (chunks.length === 0) return;

        chunksRef.current = chunks;
        chunkIndexRef.current = 0;
        voiceRef.current = voice;
        speedRef.current = speed;

        // Nếu không có API key → dùng browser ngay
        if (!apiKey || apiKey === "your_fpt_api_key_here") {
          speakWithBrowserFallback(text, speed);
          return;
        }

        await fetchAndPlayChunk(chunks[0], 0, chunks.length, text, speed);
      }, 100);
    },
    [stopAudio, fetchAndPlayChunk, speakWithBrowserFallback, apiKey]
  );

  return {
    speak,
    stop: stopAudio,
    speaking,
    loading,
    progress,
    mode,
    error,
  };
}
