import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Slider,
  Card,
  Typography,
  Space,
  Tooltip,
  message,
} from "antd";
import {
  VideoCameraOutlined,
  SoundOutlined,
  InfoCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useGenerateVideo } from "../hooks/useVideoGenerator";
import type { GenerateVideoPayload } from "../api/video-generator.api";
import { useAdminStories } from "@/modules/stories/hooks/useStories";
import { useChaptersByStory } from "@/modules/framework/hooks/useChapters";
import { useFrameworkByStory } from "@/modules/framework/hooks/useFramework";

const { TextArea } = Input;
const { Text } = Typography;

const VOICES = [
  { label: "🧑 Nam Minh (Nam · Hà Nội)", value: "vi-VN-NamMinhNeural" },
  { label: "👩 Hoài My (Nữ · Hà Nội)", value: "vi-VN-HoaiMyNeural" },
];

const rateToStr = (val: number): string => {
  if (val === 0) return "+0%";
  if (val > 0) return `+${val}%`;
  return `${val}%`;
};

export default function VideoGeneratorForm() {
  const [form] = Form.useForm();
  const { mutate: generate, isPending } = useGenerateVideo();
  const [rate, setRate] = useState(0);

  // Auto-fill states
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  );

  // Queries
  const { data: stories = [], isLoading: isLoadingStories } = useAdminStories();
  const { data: chaptersData } = useChaptersByStory(selectedStoryId || 0);
  const { data: framework } = useFrameworkByStory(selectedStoryId || 0);

  const chapters = chaptersData?.chapters || [];

  // Flatten framework episodes if any
  const frameworkEpisodes =
    framework?.phases?.flatMap((p) =>
      (p.episodes || []).map((ep) => ({
        ...ep,
        phaseTitle: p.title,
      })),
    ) || [];

  // Handle story selection change
  const handleSelectStory = (storyId: number) => {
    setSelectedStoryId(storyId);
    setSelectedEpisodeId(null);

    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    let autoTitle = story.title;
    let autoScriptParts: string[] = [];

    if (story.setting) {
      autoScriptParts.push(`Bối cảnh: ${story.setting}`);
    }
    if (story.characters) {
      autoScriptParts.push(`Nhân vật: ${story.characters}`);
    }

    if (story.content) {
      autoScriptParts.push(story.content);
    } else if (story.description) {
      autoScriptParts.push(story.description);
    }

    form.setFieldsValue({
      title: autoTitle,
      script: autoScriptParts.join("\n\n"),
    });

    message.info(`Đã tự động điền dữ liệu cho truyện "${story.title}"`);
  };

  // Handle chapter/episode selection change
  const handleSelectEpisode = (val: string) => {
    setSelectedEpisodeId(val);
    const story = stories.find((s) => s.id === selectedStoryId);
    if (!story) return;

    if (val.startsWith("chap-")) {
      const chapId = Number(val.replace("chap-", ""));
      const chap = chapters.find((c) => c.id === chapId);
      if (chap) {
        const title = `${story.title} - Tập ${chap.chapterNumber}: ${chap.title}`;
        let scriptParts: string[] = [];

        if (story.setting) scriptParts.push(`Bối cảnh: ${story.setting}`);
        if (story.characters) scriptParts.push(`Nhân vật: ${story.characters}`);
        scriptParts.push(chap.content || chap.synopsis || "");

        form.setFieldsValue({
          title,
          script: scriptParts.filter(Boolean).join("\n\n"),
        });
        message.info(
          `Đã tự động điền dữ liệu cho Chương ${chap.chapterNumber}: ${chap.title}`,
        );
      }
    } else if (val.startsWith("ep-")) {
      const epId = Number(val.replace("ep-", ""));
      const ep = frameworkEpisodes.find((e) => e.id === epId);
      if (ep) {
        const title = `${story.title} - Tập ${ep.episodeNumber}: ${ep.title}`;
        let scriptParts: string[] = [];

        if (story.setting) scriptParts.push(`Bối cảnh: ${story.setting}`);
        if (ep.charactersInvolved || story.characters) {
          scriptParts.push(
            `Nhân vật: ${ep.charactersInvolved || story.characters}`,
          );
        }
        if (ep.synopsis) scriptParts.push(`Tóm tắt: ${ep.synopsis}`);
        if (ep.keyEvents) scriptParts.push(`Sự kiện chính: ${ep.keyEvents}`);

        form.setFieldsValue({
          title,
          script: scriptParts.filter(Boolean).join("\n\n"),
        });
        message.info(
          `Đã tự động điền dữ liệu cho Tập ${ep.episodeNumber}: ${ep.title}`,
        );
      }
    }
  };

  const handleSubmit = (values: {
    title: string;
    script: string;
    voice: string;
  }) => {
    const payload: GenerateVideoPayload = {
      title: values.title,
      script: values.script,
      voice: values.voice,
      rate: rateToStr(rate),
    };
    generate(payload, {
      onSuccess: () => {
        form.resetFields();
        setSelectedStoryId(null);
        setSelectedEpisodeId(null);
      },
    });
  };

  return (
    <Card
      className="shadow-sm"
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 28 } }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <VideoCameraOutlined style={{ color: "white", fontSize: 22 }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 m-0">
            Tạo Video từ Kịch Bản
          </h2>
          <Text type="secondary" className="text-sm">
            Chọn truyện có sẵn hoặc nhập kịch bản tự do → AI tự tạo video với
            giọng đọc
          </Text>
        </div>
      </div>

      {/* ─── Nút/Khu vực Chọn Truyện Có Sẵn ─── */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOutlined className="text-purple-600" />
          <span className="font-bold text-sm text-purple-900">
            Chọn từ Quản Lý Truyện (Tự động điền dữ liệu)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Select Story */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Tác phẩm / Bộ truyện
            </label>
            <Select
              placeholder="-- Chọn bộ truyện --"
              loading={isLoadingStories}
              value={selectedStoryId}
              onChange={handleSelectStory}
              className="w-full"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={stories.map((s) => ({
                label: `${s.title} (${s.isShortStory ? "Truyện ngắn" : "Truyện dài"})`,
                value: s.id,
              }))}
            />
          </div>

          {/* Select Chapter / Episode */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Tập / Chương (nếu có)
            </label>
            <Select
              placeholder="-- Chọn tập / chương --"
              disabled={
                !selectedStoryId ||
                (chapters.length === 0 && frameworkEpisodes.length === 0)
              }
              value={selectedEpisodeId}
              onChange={handleSelectEpisode}
              className="w-full"
              allowClear
              options={[
                ...chapters.map((c) => ({
                  label: `Chương ${c.chapterNumber}: ${c.title}`,
                  value: `chap-${c.id}`,
                })),
                ...frameworkEpisodes.map((e) => ({
                  label: `Tập ${e.episodeNumber}: ${e.title} (${e.phaseTitle})`,
                  value: `ep-${e.id}`,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Tiêu đề */}
        <Form.Item
          name="title"
          label={
            <span className="font-semibold text-gray-700">
              Tiêu đề phim / video
            </span>
          }
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        >
          <Input
            placeholder="Ví dụ: Cảnh 1 - Cuộc gặp gỡ định mệnh"
            size="large"
            maxLength={200}
            showCount
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        {/* Kịch bản */}
        <Form.Item
          name="script"
          label={
            <Space>
              <span className="font-semibold text-gray-700">
                Nội dung kịch bản
              </span>
              <Tooltip title="Nội dung cảnh phim, bối cảnh, lời thoại nhân vật, mô tả diễn biến...">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </Space>
          }
          rules={[
            { required: true, message: "Vui lòng nhập nội dung kịch bản" },
            { min: 20, message: "Kịch bản quá ngắn (tối thiểu 20 ký tự)" },
          ]}
        >
          <TextArea
            placeholder={`Ví dụ:\nTrong một buổi chiều thu ảm đạm, Minh đứng trước cửa căn nhà cũ...\nAnh nhìn vào bên trong qua ô cửa sổ, bóng tối nuốt chửng mọi thứ.\n"Mẹ ơi, con đã về..." - giọng anh run rẩy.`}
            rows={7}
            maxLength={10000}
            showCount
            style={{ borderRadius: 10, resize: "vertical" }}
          />
        </Form.Item>

        {/* Cài đặt giọng đọc */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="voice"
            label={
              <Space>
                <SoundOutlined />
                <span className="font-semibold text-gray-700">Giọng đọc</span>
              </Space>
            }
            initialValue="vi-VN-NamMinhNeural"
          >
            <Select
              options={VOICES}
              style={{ borderRadius: 10 }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Tốc độ đọc &nbsp;
                <Text type="secondary" className="text-xs font-normal">
                  ({rate > 0 ? "+" : ""}
                  {rate}%)
                </Text>
              </span>
            }
          >
            <Slider
              min={-30}
              max={50}
              step={5}
              value={rate}
              onChange={setRate}
              marks={{ "-30": "Chậm", 0: "Bình thường", 50: "Nhanh" }}
              tooltip={{ formatter: (v) => `${v! > 0 ? "+" : ""}${v}%` }}
            />
          </Form.Item>
        </div>

        {/* Submit */}
        <Form.Item className="mb-0 mt-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            icon={<VideoCameraOutlined />}
            size="large"
            block
            style={{
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              border: "none",
              borderRadius: 12,
              height: 48,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {isPending ? "Đang gửi yêu cầu..." : "🎬 Bắt Đầu Tạo Video"}
          </Button>
          <Text type="secondary" className="block text-center text-xs mt-2">
            Video sẽ được xử lý trong nền (2-5 phút). Bạn có thể làm việc khác
            trong khi chờ.
          </Text>
        </Form.Item>
      </Form>
    </Card>
  );
}
