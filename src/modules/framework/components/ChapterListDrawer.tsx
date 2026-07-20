import { useState } from "react";
import {
  Drawer,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  message,
  Progress,
  Empty,
  Spin,
} from "antd";
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  FireOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  useChaptersByStory,
  useDeleteChapter,
  useUpdateChapter,
} from "../hooks/useChapters";
import type { Chapter } from "@/apis/chapters.api";
import StoryVideoModal from "./StoryVideoModal";

const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  storyId: number;
  storyTitle: string;
  totalEpisodes: number; // from framework
  onAddChapter?: () => void;
}

export default function ChapterListDrawer({
  open,
  onClose,
  storyId,
  storyTitle,
  totalEpisodes,
  onAddChapter,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [readOpen, setReadOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [editForm] = Form.useForm();

  const { data, isLoading } = useChaptersByStory(storyId);
  const deleteMutation = useDeleteChapter();
  const updateMutation = useUpdateChapter();

  const chapters = data?.chapters || [];
  const total = data?.total || 0;
  const pct = totalEpisodes > 0 ? Math.round((total / totalEpisodes) * 100) : 0;

  const openEdit = (ch: Chapter) => {
    setActiveChapter(ch);
    editForm.setFieldsValue({
      title: ch.title,
      synopsis: ch.synopsis,
      content: ch.content,
    });
    setEditOpen(true);
  };

  const openRead = (ch: Chapter) => {
    setActiveChapter(ch);
    setReadOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!activeChapter) return;
    try {
      await updateMutation.mutateAsync({
        storyId,
        chapterNumber: activeChapter.chapterNumber,
        payload: values,
      });
      message.success("Cập nhật tập thành công");
      setEditOpen(false);
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async (ch: Chapter) => {
    try {
      await deleteMutation.mutateAsync({
        storyId,
        chapterNumber: ch.chapterNumber,
      });
      message.success("Đã xóa tập");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width={520}
        title={null}
        styles={{ body: { padding: 0 }, header: { display: "none" } }}
      >
        {/* ── Header ── */}
        <div className="bg-linear-to-r from-violet-600 to-purple-700 p-5">
          <div className="flex items-center gap-2 text-purple-200 text-xs mb-1">
            <BookOutlined />
            <span>Quản lý tập truyện</span>
          </div>
          <h2 className="text-white font-bold text-lg leading-tight mb-3">
            {storyTitle}
          </h2>

          {/* Progress */}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Tiến độ xuất bản</span>
              <span className="text-white font-black text-xl">{pct}%</span>
            </div>
            <Progress
              percent={pct}
              showInfo={false}
              strokeColor={{ "0%": "#a78bfa", "100%": "#34d399" }}
              trailColor="rgba(255,255,255,0.2)"
              strokeWidth={8}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/70 text-xs">
                <span className="font-bold text-white">{total}</span> tập đã
                xuất bản
              </span>
              <span className="text-white/70 text-xs">
                Tổng dự kiến:{" "}
                <span className="font-bold text-white">{totalEpisodes}</span>{" "}
                tập
              </span>
            </div>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
          <span className="text-sm font-semibold text-gray-700">
            📚 Danh sách tập ({total})
          </span>
          {onAddChapter && (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAddChapter}
              style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
              className="rounded-lg text-xs"
            >
              Thêm tập
            </Button>
          )}
        </div>

        {/* ── Chapter list ── */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 280px)" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spin />
            </div>
          ) : chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Empty description={null} />
              <p className="text-gray-400 text-sm">
                Chưa có tập nào được xuất bản
              </p>
              <p className="text-gray-300 text-xs">
                Dùng nút ✨ AI trên mỗi tập để tự động tạo nội dung
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="group flex items-start gap-3 px-4 py-3.5 hover:bg-purple-50/40 transition-colors"
                >
                  {/* Number badge */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-black">
                      {ch.chapterNumber}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 leading-tight truncate">
                      {ch.title}
                    </p>
                    {ch.synopsis && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {ch.synopsis}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <EyeOutlined style={{ fontSize: 9 }} />
                        {ch.views} lượt đọc
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <ClockCircleOutlined style={{ fontSize: 9 }} />
                        {new Date(ch.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openRead(ch)}
                      className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <EyeOutlined style={{ fontSize: 11 }} />
                    </button>
                    <button
                      onClick={() => openEdit(ch)}
                      className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <EditOutlined style={{ fontSize: 11 }} />
                    </button>
                    <button
                      onClick={() => {
                        setActiveChapter(ch);
                        setVideoOpen(true);
                      }}
                      title="Tạo video"
                      className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-500 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      <VideoCameraOutlined style={{ fontSize: 11 }} />
                    </button>
                    <Popconfirm
                      title={`Xóa Tập ${ch.chapterNumber}?`}
                      description="Nội dung tập sẽ bị xóa vĩnh viễn."
                      onConfirm={() => handleDelete(ch)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <button className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors cursor-pointer">
                        <DeleteOutlined style={{ fontSize: 11 }} />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      {/* ── Video Modal ── */}
      <StoryVideoModal
        open={videoOpen}
        onClose={() => {
          setVideoOpen(false);
          setActiveChapter(null);
        }}
        chapter={activeChapter}
        storyTitle={storyTitle}
      />

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        title={
          <span className="font-bold text-gray-800">
            ✏️ Chỉnh sửa Tập {activeChapter?.chapterNumber}:{" "}
            {activeChapter?.title}
          </span>
        }
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setEditOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateMutation.isPending}
            onClick={() => editForm.validateFields().then(handleUpdate)}
            style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
          >
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Tên tập <span className="text-red-500">*</span>
              </span>
            }
            name="title"
            rules={[{ required: true }]}
          >
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={<span className="font-semibold text-gray-700">Tóm tắt</span>}
            name="synopsis"
          >
            <TextArea rows={2} className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Nội dung <span className="text-red-500">*</span>
              </span>
            }
            name="content"
            rules={[{ required: true }]}
          >
            <TextArea
              rows={12}
              className="rounded-lg"
              style={{ fontFamily: "inherit", lineHeight: 1.8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Read Modal ── */}
      <Modal
        open={readOpen}
        onCancel={() => setReadOpen(false)}
        title={
          <div>
            <div className="text-xs text-gray-400 font-normal mb-0.5">
              {storyTitle}
            </div>
            <div className="font-bold text-gray-800">
              Tập {activeChapter?.chapterNumber}: {activeChapter?.title}
            </div>
          </div>
        }
        width={750}
        footer={[
          <Button key="close" onClick={() => setReadOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              setReadOpen(false);
              if (activeChapter) openEdit(activeChapter);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
      >
        <div
          className="max-h-[65vh] overflow-y-auto pr-2"
          style={{
            lineHeight: 2,
            fontSize: 15,
            color: "#374151",
            fontFamily: "inherit",
          }}
        >
          {activeChapter?.content?.split("\n").map((line, i) => (
            <p
              key={i}
              className={`${line.startsWith("##") ? "font-bold text-gray-900 text-base mt-4 mb-2" : "mb-0"}`}
            >
              {line || "\u00A0"}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <EyeOutlined style={{ fontSize: 11 }} />
            {activeChapter?.views} lượt đọc
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FireOutlined style={{ fontSize: 11 }} />~
            {activeChapter?.content?.split(/\s+/).filter(Boolean).length || 0}{" "}
            từ
          </span>
        </div>
      </Modal>
    </>
  );
}
