import { useState, useMemo } from "react";
import { Button, Popconfirm, Tag, message, Input, Modal, Skeleton } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  EyeOutlined,
  BookOutlined,
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { type Story } from "@/apis/stories.api";
import {
  useAdminStories,
  useDeleteStory,
  useApproveStory,
  useRejectStory,
} from "../hooks/useStories";
import { useChaptersByStory } from "@/modules/framework/hooks/useChapters";
import { useAdminFrameworks } from "@/modules/framework/hooks/useFramework";
import ChapterListDrawer from "@/modules/framework/components/ChapterListDrawer";

const fallback =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=70";

// ─── Per-story card that fetches its own chapter/framework data ─────────────
function StoryCard({
  story,
  onDelete,
  onApprove,
  onPreview,
  onViewChapters,
}: {
  story: Story;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onPreview: (s: Story) => void;
  onViewChapters: (s: Story) => void;
}) {
  const navigate = useNavigate();
  const { data: chaptersData } = useChaptersByStory(story.id);
  const { data: allFrameworks = [] } = useAdminFrameworks();

  const framework = allFrameworks.find((fw) => fw.storyId === story.id);
  const publishedCount = chaptersData?.total || 0;
  const totalExpected = framework?.totalEpisodes || 0;
  const pct =
    totalExpected > 0 ? Math.round((publishedCount / totalExpected) * 100) : 0;

  const statusConfig = story.isApproved
    ? {
        label: "Đã duyệt",
        color: "#16a34a",
        bg: "bg-green-50",
        text: "text-green-700",
        dot: "bg-green-500",
      }
    : story.isRejected
      ? {
          label: "Từ chối",
          color: "#dc2626",
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
        }
      : {
          label: "Chờ duyệt",
          color: "#d97706",
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-400",
        };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-violet-200 flex flex-col">
      {/* Cover image */}
      <div
        className="relative overflow-hidden"
        style={{ paddingTop: "56.25%" }}
      >
        <img
          src={story.coverImage || fallback}
          alt={story.title}
          onError={(e) => ((e.target as HTMLImageElement).src = fallback)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay linear */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} text-[10px] font-bold px-2.5 py-1 rounded-full border border-current/20`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}
            />
            {statusConfig.label}
          </span>
        </div>

        {/* Genre badge */}
        {story.genre && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              {story.genre.name}
            </span>
          </div>
        )}

        {/* Chapter count overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onViewChapters(story)}
            className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-violet-700 font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer backdrop-blur-sm"
          >
            <BookOutlined />
            Xem danh sách tập
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-violet-700 transition-colors">
          {story.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">✍️ {story.author}</p>

        {/* Chapter progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Tiến độ xuất bản
            </span>
            <span className="text-[10px] font-black text-violet-600">
              {publishedCount}/{totalExpected > 0 ? totalExpected : "?"} tập
            </span>
          </div>
          {totalExpected > 0 ? (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <div className="w-full h-1.5 bg-gray-100 rounded-full">
              <div className="h-full w-0 bg-gray-300 rounded-full" />
            </div>
          )}
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">
              {publishedCount > 0 ? `${pct}% hoàn thành` : "Chưa xuất bản"}
            </span>
            {framework && (
              <span className="text-[9px] text-gray-400">
                {framework.phases?.length || 0} giai đoạn
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {story.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
            {story.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
          <button
            onClick={() => onViewChapters(story)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-[11px] py-2 rounded-xl transition-colors cursor-pointer"
          >
            <BookOutlined style={{ fontSize: 11 }} />
            {publishedCount > 0 ? `${publishedCount} tập` : "Tập truyện"}
          </button>
          <button
            onClick={() => onPreview(story)}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
          >
            <EyeOutlined style={{ fontSize: 12 }} />
          </button>
          <button
            onClick={() => navigate(`/stories/${story.id}/edit`)}
            className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors cursor-pointer"
          >
            <EditOutlined style={{ fontSize: 12 }} />
          </button>
          {!story.isApproved && !story.isRejected && (
            <button
              onClick={() => onApprove(story.id)}
              className="w-8 h-8 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors cursor-pointer"
            >
              <CheckOutlined style={{ fontSize: 12 }} />
            </button>
          )}
          <Popconfirm
            title="Xóa truyện?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => onDelete(story.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors cursor-pointer">
              <DeleteOutlined style={{ fontSize: 12 }} />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StoriesListPage() {
  const navigate = useNavigate();
  const { data: stories = [], isLoading } = useAdminStories();
  const deleteStoryMutation = useDeleteStory();
  const approveStoryMutation = useApproveStory();
  const rejectStoryMutation = useRejectStory();

  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [chapterStory, setChapterStory] = useState<Story | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: allFrameworks = [] } = useAdminFrameworks();

  const handleDelete = async (id: number) => {
    try {
      await deleteStoryMutation.mutateAsync(id);
      message.success("Xóa truyện thành công");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveStoryMutation.mutateAsync(id);
      message.success("Đã duyệt truyện");
    } catch {
      message.error("Duyệt truyện thất bại");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectStoryMutation.mutateAsync(id);
    } catch {
      message.error("Từ chối thất bại");
    }
  };

  const filtered = useMemo(() => {
    let result = stories;
    if (filter === "approved") result = result.filter((s) => s.isApproved);
    else if (filter === "pending")
      result = result.filter((s) => !s.isApproved && !s.isRejected);
    else if (filter === "rejected") result = result.filter((s) => s.isRejected);
    if (search)
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.author.toLowerCase().includes(search.toLowerCase()),
      );
    return result;
  }, [stories, filter, search]);

  const stats = useMemo(
    () => ({
      total: stories.length,
      approved: stories.filter((s) => s.isApproved).length,
      pending: stories.filter((s) => !s.isApproved && !s.isRejected).length,
      rejected: stories.filter((s) => s.isRejected).length,
    }),
    [stories],
  );

  const chapterFramework = chapterStory
    ? allFrameworks.find((fw) => fw.storyId === chapterStory.id)
    : null;

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              <Skeleton.Image
                active
                className="w-full"
                style={{ height: 180, width: "100%" }}
              />
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/20 to-indigo-50/10 p-5">
      {/* ── Hero Stats ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 mb-5 shadow-xl shadow-purple-200">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-white translate-y-1/2" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
              <BookOutlined />
              <span>Thư viện truyện</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Quản lý Truyện</h1>
            <p className="text-purple-200 text-sm mt-1">
              Toàn bộ danh sách truyện và tiến độ xuất bản tập
            </p>
          </div>
          <div className="flex gap-3">
            {[
              {
                label: "Tổng truyện",
                value: stats.total,
                color: "bg-white/20",
              },
              {
                label: "Đã duyệt",
                value: stats.approved,
                color: "bg-green-400/30",
              },
              {
                label: "Chờ duyệt",
                value: stats.pending,
                color: "bg-amber-400/30",
              },
              {
                label: "Từ chối",
                value: stats.rejected,
                color: "bg-red-400/30",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.color} backdrop-blur-sm rounded-xl px-4 py-2.5 text-center min-w-[70px]`}
              >
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-white/70 text-[10px] font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm theo tiêu đề, tác giả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl flex-1"
          allowClear
        />

        {/* Filter tabs */}
        <div className="flex gap-1.5 shrink-0">
          {[
            { key: "all", label: "Tất cả", count: stats.total },
            { key: "approved", label: "Đã duyệt", count: stats.approved },
            { key: "pending", label: "Chờ duyệt", count: stats.pending },
            { key: "rejected", label: "Từ chối", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span
                className={`${filter === tab.key ? "bg-white/30" : "bg-gray-200"} text-[10px] px-1.5 py-0.5 rounded-full font-black`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-violet-600" : "text-gray-400"}`}
          >
            <AppstoreOutlined style={{ fontSize: 13 }} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${viewMode === "list" ? "bg-white shadow-sm text-violet-600" : "text-gray-400"}`}
          >
            <BarsOutlined style={{ fontSize: 13 }} />
          </button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/stories/create")}
          style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
          className="rounded-xl shrink-0"
        >
          Thêm truyện
        </Button>
      </div>

      {/* ── Count ── */}
      <div className="mb-4 text-sm text-gray-500 font-medium">
        Hiển thị{" "}
        <span className="text-violet-600 font-bold">{filtered.length}</span>{" "}
        truyện
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <BookOutlined className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-400 font-medium">Không tìm thấy truyện nào</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              onPreview={setPreviewStory}
              onViewChapters={setChapterStory}
            />
          ))}
        </div>
      ) : (
        /* List mode */
        <div className="space-y-3">
          {filtered.map((story) => (
            <ListRow
              key={story.id}
              story={story}
              frameworks={allFrameworks}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onPreview={setPreviewStory}
              onViewChapters={setChapterStory}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* ── Preview Modal ── */}
      <Modal
        open={!!previewStory}
        onCancel={() => setPreviewStory(null)}
        title={
          <div className="border-b pb-3 pr-6">
            <h2 className="font-bold text-gray-900 text-lg">
              {previewStory?.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              ✍️ {previewStory?.author}
              {previewStory?.genre && (
                <span className="ml-2 text-violet-500">
                  · {previewStory.genre.name}
                </span>
              )}
            </p>
          </div>
        }
        footer={[
          <Button key="close" onClick={() => setPreviewStory(null)}>
            Đóng
          </Button>,
          previewStory &&
            !previewStory.isApproved &&
            !previewStory.isRejected && (
              <Popconfirm
                key="approve"
                title="Duyệt truyện này?"
                onConfirm={() => {
                  if (previewStory) {
                    handleApprove(previewStory.id);
                    setPreviewStory(null);
                  }
                }}
                okText="Duyệt"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}
                >
                  <CheckOutlined /> Duyệt xuất bản
                </Button>
              </Popconfirm>
            ),
        ].filter(Boolean)}
        width={750}
      >
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {previewStory?.description && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-5 rounded-r-xl">
              <p className="text-xs font-bold text-orange-700 mb-1">Tóm tắt</p>
              <p className="text-sm italic text-gray-700">
                {previewStory.description}
              </p>
            </div>
          )}
          {(previewStory?.characters || previewStory?.setting) && (
            <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {previewStory?.characters && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">
                    🎭 Nhân vật
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {previewStory.characters}
                  </p>
                </div>
              )}
              {previewStory?.setting && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">
                    🌍 Bối cảnh
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {previewStory.setting}
                  </p>
                </div>
              )}
            </div>
          )}
          {previewStory?.content && (
            <div className="font-serif text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
              {previewStory.content.substring(0, 2000)}
              {previewStory.content.length > 2000 && (
                <span className="text-gray-400">... [xem thêm]</span>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ── Chapter Drawer ── */}
      {chapterStory && (
        <ChapterListDrawer
          open={!!chapterStory}
          onClose={() => setChapterStory(null)}
          storyId={chapterStory.id}
          storyTitle={chapterStory.title}
          totalEpisodes={chapterFramework?.totalEpisodes || 0}
        />
      )}
    </div>
  );
}

// ─── List row view ───────────────────────────────────────────────────────────
function ListRow({
  story,
  frameworks,
  onDelete,
  onApprove,
  onPreview,
  onViewChapters,
  navigate,
}: {
  story: Story;
  frameworks: any[];
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onPreview: (s: Story) => void;
  onViewChapters: (s: Story) => void;
  navigate: (path: string) => void;
}) {
  const { data: chaptersData } = useChaptersByStory(story.id);
  const framework = frameworks.find((fw) => fw.storyId === story.id);
  const publishedCount = chaptersData?.total || 0;
  const totalExpected = framework?.totalEpisodes || 0;
  const pct =
    totalExpected > 0 ? Math.round((publishedCount / totalExpected) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4 items-center group">
      <img
        src={story.coverImage || fallback}
        alt={story.title}
        onError={(e) => ((e.target as HTMLImageElement).src = fallback)}
        className="w-16 h-20 object-cover rounded-xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm truncate flex-1">
            {story.title}
          </h3>
          {story.isApproved ? (
            <Tag color="success" className="shrink-0">
              Đã duyệt
            </Tag>
          ) : story.isRejected ? (
            <Tag color="error" className="shrink-0">
              Từ chối
            </Tag>
          ) : (
            <Tag color="warning" className="shrink-0">
              Chờ duyệt
            </Tag>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">
          ✍️ {story.author} {story.genre && `· ${story.genre.name}`}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-violet-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-violet-600 shrink-0">
            {publishedCount}/{totalExpected || "?"} tập
          </span>
        </div>
      </div>
      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onViewChapters(story)}
          className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <BookOutlined style={{ fontSize: 11 }} /> Tập truyện
        </button>
        <button
          onClick={() => onPreview(story)}
          className="w-7 h-7 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
        >
          <EyeOutlined style={{ fontSize: 11 }} />
        </button>
        <button
          onClick={() => navigate(`/stories/${story.id}/edit`)}
          className="w-7 h-7 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
        >
          <EditOutlined style={{ fontSize: 11 }} />
        </button>
        {!story.isApproved && !story.isRejected && (
          <button
            onClick={() => onApprove(story.id)}
            className="w-7 h-7 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors cursor-pointer"
          >
            <CheckOutlined style={{ fontSize: 11 }} />
          </button>
        )}
        <Popconfirm
          title="Xóa truyện?"
          onConfirm={() => onDelete(story.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <button className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors cursor-pointer">
            <DeleteOutlined style={{ fontSize: 11 }} />
          </button>
        </Popconfirm>
      </div>
    </div>
  );
}
