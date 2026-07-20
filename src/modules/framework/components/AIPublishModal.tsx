import { useState, useRef } from "react";
import { Modal, Input, Button, message, Spin, Alert, Select } from "antd";
import {
  ThunderboltOutlined,
  CopyOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { FrameworkEpisode, FrameworkPhase } from "@/apis/framework.api";
import { getDefaultGeminiKey } from "@/common/utils/geminiKey";

interface Props {
  open: boolean;
  onClose: () => void;
  episode: FrameworkEpisode | null;
  phase: FrameworkPhase | null;
  storyTitle: string;
  storyOverview?: string;
  storyCharacters?: string;
  storySetting?: string;
  onPublish: (
    episodeNumber: number,
    title: string,
    content: string,
  ) => Promise<void>;
}

const getGeminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function buildPrompt(
  ep: FrameworkEpisode,
  phase: FrameworkPhase,
  storyTitle: string,
  storyOverview?: string,
  storyCharacters?: string,
  storySetting?: string,
): string {
  return `Bạn là tác giả chuyên nghiệp viết truyện tiểu thuyết theo phong cách hấp dẫn, sinh động, cuốn hút độc giả.

Hãy viết nội dung đầy đủ cho **Tập ${ep.episodeNumber}: ${ep.title}** của bộ truyện **"${storyTitle}"**.

## Thông tin bộ truyện
${storyOverview ? `- Tổng quan: ${storyOverview}` : ""}
${storyCharacters ? `- Nhân vật: ${storyCharacters}` : ""}
${storySetting ? `- Bối cảnh: ${storySetting}` : ""}

## Thông tin giai đoạn hiện tại
- Giai đoạn: ${phase.title}
- Mô tả giai đoạn: ${phase.description || "(không có)"}
- Phạm vi: Tập ${phase.episodeFrom} đến tập ${phase.episodeTo}

## Thông tin tập cần viết
- Số tập: ${ep.episodeNumber}
- Tên tập: ${ep.title}
- Tóm tắt nội dung: ${ep.synopsis || "(không có)"}
- Sự kiện chính: ${ep.keyEvents || "(không có)"}
- Nhân vật xuất hiện: ${ep.charactersInvolved || "(không có)"}

## Yêu cầu viết
1. Viết nội dung đầy đủ, chi tiết, có chiều sâu cảm xúc (tối thiểu 1500 từ)
2. Mở đầu hấp dẫn, kéo người đọc vào ngay lập tức
3. Phát triển diễn biến theo đúng sự kiện chính đã nêu
4. Kết thúc tập có điểm nhấn, tạo sự tò mò cho tập tiếp theo
5. Viết bằng tiếng Việt, văn phong trôi chảy, tự nhiên
6. KHÔNG viết tiêu đề tập, chỉ viết nội dung truyện
7. Sử dụng đoạn văn, ngắt dòng hợp lý để dễ đọc

Bắt đầu viết nội dung tập truyện:`;
}

export default function AIPublishModal({
  open,
  onClose,
  episode,
  phase,
  storyTitle,
  storyOverview,
  storyCharacters,
  storySetting,
  onPublish,
}: Props) {
  const [apiKey, setApiKey] = useState(() => getDefaultGeminiKey());
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem("gemini_model") || "gemini-3.5-flash",
  );
  const abortRef = useRef<AbortController | null>(null);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) localStorage.setItem("gemini_api_key", key);
    else localStorage.removeItem("gemini_api_key");
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      message.error("Vui lòng nhập Gemini API Key");
      return;
    }
    if (!episode || !phase) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setShowPreview(true);

    abortRef.current = new AbortController();

    try {
      const prompt = buildPrompt(
        episode,
        phase,
        storyTitle,
        storyOverview,
        storyCharacters,
        storySetting,
      );

      const response = await fetch(`${getGeminiUrl(selectedModel)}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || `Lỗi API: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) throw new Error("Gemini không trả về nội dung");
      setGeneratedContent(text);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        message.error(err.message || "Sinh nội dung thất bại");
        setShowPreview(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handlePublish = async () => {
    if (!episode || !generatedContent) return;
    setIsPublishing(true);
    try {
      await onPublish(episode.episodeNumber, episode.title, generatedContent);
      message.success(
        `✅ Đã xuất bản Tập ${episode.episodeNumber}: ${episode.title}`,
      );
      onClose();
      setGeneratedContent("");
      setShowPreview(false);
    } catch {
      message.error("Xuất bản thất bại");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    message.success("Đã copy nội dung");
  };

  const handleClose = () => {
    if (isGenerating) handleStop();
    onClose();
    setGeneratedContent("");
    setShowPreview(false);
  };

  if (!episode || !phase) return null;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-bold text-gray-800">
            AI Xuất Bản — Tập {episode.episodeNumber}: {episode.title}
          </span>
        </div>
      }
      width={900}
      footer={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* ─── Sidebar: config + info ─── */}
        <div className="flex gap-0 flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-72 shrink-0 border-r border-gray-100 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* API Key */}
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                🔑 Gemini API Key
              </label>
              <Input.Password
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="AIzaSy..."
                size="small"
                className="rounded-lg"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Được lưu trong trình duyệt. Lấy key tại{" "}
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

            {/* Model Selection */}
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                🤖 AI Model
              </label>
              <Select
                value={selectedModel}
                onChange={(val) => {
                  setSelectedModel(val);
                  localStorage.setItem("gemini_model", val);
                }}
                className="w-full"
                size="small"
                options={[
                  { label: "Gemini 3.5 Flash", value: "gemini-3.5-flash" },
                  { label: "Gemini 3.1 Pro Preview", value: "gemini-3.1-pro-preview" },
                  { label: "Gemini 3.1 Flash Lite", value: "gemini-3.1-flash-lite" },
                  { label: "Gemini 3 Flash Preview", value: "gemini-3-flash-preview" },
                  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
                  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
                  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
                  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
                ]}
              />
            </div>

            {/* Episode info */}
            <div className="bg-purple-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                📋 Thông tin tập
              </p>
              <div className="space-y-1.5">
                <InfoRow label="Giai đoạn" value={phase.title} />
                <InfoRow
                  label="Số tập"
                  value={`Tập ${episode.episodeNumber}`}
                />
                <InfoRow label="Tên tập" value={episode.title} />
                {episode.synopsis && (
                  <InfoRow label="Tóm tắt" value={episode.synopsis} />
                )}
                {episode.keyEvents && (
                  <InfoRow label="Sự kiện" value={episode.keyEvents} />
                )}
                {episode.charactersInvolved && (
                  <InfoRow
                    label="Nhân vật"
                    value={episode.charactersInvolved}
                  />
                )}
              </div>
            </div>

            {/* Story context */}
            {(storyOverview || storyCharacters || storySetting) && (
              <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  📖 Ngữ cảnh truyện
                </p>
                {storyOverview && (
                  <InfoRow label="Tổng quan" value={storyOverview} />
                )}
                {storyCharacters && (
                  <InfoRow label="Nhân vật" value={storyCharacters} />
                )}
                {storySetting && (
                  <InfoRow label="Bối cảnh" value={storySetting} />
                )}
              </div>
            )}
          </div>

          {/* Right panel: content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!showPreview ? (
              /* Start screen */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <ThunderboltOutlined className="text-white text-2xl" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">
                    Sẵn sàng xuất bản
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    AI sẽ tự động viết nội dung tập truyện dựa trên khung kịch
                    bản đã thiết lập
                  </p>
                </div>
                {!apiKey && (
                  <Alert
                    type="warning"
                    message="Vui lòng nhập API Key ở bên trái trước"
                    showIcon
                    className="text-sm"
                  />
                )}
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerate}
                  disabled={!apiKey}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    border: "none",
                  }}
                  className="rounded-xl px-8 font-semibold shadow-lg"
                >
                  Tạo nội dung với AI
                </Button>
              </div>
            ) : (
              /* Content preview */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <EyeOutlined className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      Nội dung được tạo
                    </span>
                    {isGenerating && (
                      <span className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                        <Spin size="small" />
                        Đang viết...
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isGenerating ? (
                      <Button
                        size="small"
                        danger
                        onClick={handleStop}
                        className="rounded-lg"
                      >
                        ⏹ Dừng
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={handleGenerate}
                        className="rounded-lg"
                      >
                        Viết lại
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={handleCopy}
                      disabled={!generatedContent}
                      className="rounded-lg"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Content textarea */}
                <div className="flex-1 overflow-hidden p-3">
                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="w-full h-full resize-none border border-gray-200 rounded-xl p-3 text-sm text-gray-700 leading-relaxed focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nội dung AI đang được tạo..."
                    readOnly={isGenerating}
                  />
                </div>

                {/* Word count */}
                {generatedContent && (
                  <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ~{generatedContent.split(/\s+/).filter(Boolean).length} từ
                    </span>
                    <span className="text-xs text-gray-400">
                      {generatedContent.length} ký tự
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer actions ─── */}
        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50">
          <Button onClick={handleClose} className="rounded-lg">
            Đóng
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handlePublish}
            disabled={!generatedContent || isGenerating}
            loading={isPublishing}
            size="large"
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
            className="rounded-xl px-6 font-semibold"
          >
            Lưu & Xuất Bản Tập {episode?.episodeNumber}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-gray-500 uppercase">
        {label}
      </span>
      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
        {value}
      </p>
    </div>
  );
}
