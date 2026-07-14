import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReaderName } from "@/apis/readers.api";
import {
  useReaderStoryHistoryQuery,
  useUpdateRegisteredStoryMutation,
  useGenresQuery,
} from "../../dashboarch/hooks/useStories";
import { type Story } from "@/apis/stories.api";
import { Button } from "antd";

export default function SubmittedStoriesPage() {
  const navigate = useNavigate();
  const authorName = getReaderName() || "";

  const {
    data: history = [],
    isLoading,
    refetch,
  } = useReaderStoryHistoryQuery(authorName);
  const updateMutation = useUpdateRegisteredStoryMutation();
  const { data: genres = [] } = useGenresQuery();

  // Edit modal states
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [genreId, setGenreId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isShortStory, setIsShortStory] = useState(false);
  const [editError, setEditError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleOpenEdit = (story: Story) => {
    setEditingStory(story);
    setTitle(story.title);
    setGenreId(story.genre?.id || "");
    setDescription(story.description || "");
    setCoverImage(story.coverImage || "");
    setContent(story.content || "");
    setIsShortStory(story.isShortStory || false);
    setEditError("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editingStory) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) return setEditError("Vui lòng nhập tiêu đề truyện");
    if (!genreId) return setEditError("Vui lòng chọn thể loại truyện");
    if (!trimmedContent) return setEditError("Vui lòng nhập nội dung truyện");

    updateMutation.mutate(
      {
        id: editingStory.id,
        dto: {
          title: trimmedTitle,
          author: authorName,
          genreId: Number(genreId),
          description: description.trim(),
          coverImage: coverImage.trim(),
          content: trimmedContent,
          isShortStory,
        },
      },
      {
        onSuccess: () => {
          setShowSuccessToast(true);
          setEditingStory(null);
          refetch();
          setTimeout(() => setShowSuccessToast(false), 3000);
        },
        onError: () => {
          setEditError("Lưu chỉnh sửa thất bại. Vui lòng thử lại.");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#E5C88A] py-8 px-4 sm:px-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-green-800 text-[#EEDCBE] px-6 py-3 rounded-xl shadow-2xl border border-green-700 animate-slideUp font-semibold flex items-center gap-2">
          <span>✨</span> Lưu chỉnh sửa truyện thành công!
        </div>
      )}

      {/* Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-[#F7EAD3] border-4 border-double border-[#2D251E]/30 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D251E] mb-6 pb-2 border-b border-[#2D251E]/10">
              ✍️ Chỉnh Sửa Truyện Đăng Ký
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2D251E]">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#2D251E]">
                    Thể loại *
                  </label>
                  <select
                    value={genreId}
                    onChange={(e) =>
                      setGenreId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm cursor-pointer"
                  >
                    <option value="">-- Chọn thể loại --</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#2D251E]">
                    Loại truyện *
                  </label>
                  <select
                    value={isShortStory ? "true" : "false"}
                    onChange={(e) => setIsShortStory(e.target.value === "true")}
                    className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm cursor-pointer"
                  >
                    <option value="false">Truyện dài tập (nhiều chương)</option>
                    <option value="true">Truyện ngắn (không chương)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2D251E]">
                  Link ảnh bìa (tùy chọn)
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2D251E]">
                  Tóm tắt (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#2D251E]">
                  Nội dung truyện *
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none text-sm font-serif"
                />
              </div>

              {editError && (
                <p className="text-red-600 font-semibold text-xs text-center">
                  ⚠️ {editError}
                </p>
              )}

              <div className="flex gap-3 pt-4 border-t border-[#2D251E]/10 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-lg border border-[#2D251E]/20 bg-white/40 text-[#2D251E] hover:bg-white/70 cursor-pointer text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-lg text-white font-bold cursor-pointer text-xs shadow-md"
                  style={{
                    background: updateMutation.isPending ? "#ccc" : "#2D251E",
                  }}
                >
                  {updateMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu chỉnh sửa ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-[#F7EAD3] border-4 border-double border-[#2D251E]/30 rounded-3xl shadow-xl p-6 sm:p-10 min-h-[calc(100vh-220px)] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2D251E]/10 mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-[22px]! sm:text-3xl font-extrabold text-[#2D251E]">
                Lịch Sử Đăng Ký
              </h1>
            </div>

            <Button
              style={{
                background: "linear-gradient(135deg, #C2410C, #EA580C)",
                color: "white",
              }}
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Về Trang Chủ
            </Button>
          </div>

          {/* List Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-[#2D251E] text-lg font-semibold">
                Bạn chưa gửi đăng ký truyện nào
              </p>
              <button
                onClick={() => navigate("/register-story")}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #C2410C, #EA580C)",
                }}
              >
                Đăng ký viết truyện ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((story) => (
                <div
                  key={story.id}
                  className="bg-white/60 border border-[#2D251E]/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <img
                      src={
                        story.coverImage ||
                        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&q=60"
                      }
                      alt={story.title}
                      className="w-14 h-14 rounded-xl object-cover border border-[#2D251E]/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&q=60";
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-[#2D251E] text-base leading-snug">
                        {story.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold border border-orange-200">
                          {story.genre?.name || "Chưa phân loại"}
                        </span>
                        <span className="text-xs text-[#2D251E]/50">
                          Gửi ngày:{" "}
                          {new Date(story.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2D251E]/5">
                    <div>
                      {story.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                          ● Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                          ● Đang chờ duyệt
                        </span>
                      )}
                    </div>

                    <div>
                      {story.isApproved ? (
                        <button
                          onClick={() => navigate(`/stories/${story.id}`)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2410C] text-white hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Đọc ngay →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenEdit(story)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2D251E] text-[#EEDCBE] hover:bg-[#1E2D3D] transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          ✏️ Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
