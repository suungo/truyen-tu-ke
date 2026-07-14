import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGenresQuery,
  useRegisterStoryMutation,
} from "../../dashboarch/hooks/useStories";
import { getReaderName, isReaderLoggedIn } from "@/apis/readers.api";

export default function RegisterStoryPage() {
  const navigate = useNavigate();

  // Check login
  useEffect(() => {
    if (!isReaderLoggedIn()) {
      navigate("/auth/login?redirect=/register-story");
    }
  }, [navigate]);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(getReaderName() || "");
  const [genreId, setGenreId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isShortStory, setIsShortStory] = useState(false);

  const [formError, setFormError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: genres = [] } = useGenresQuery();
  const registerMutation = useRegisterStoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) return setFormError("Vui lòng nhập tiêu đề truyện");
    if (!trimmedAuthor) return setFormError("Vui lòng nhập tên tác giả");
    if (!genreId) return setFormError("Vui lòng chọn thể loại truyện");
    if (!trimmedContent) return setFormError("Vui lòng nhập nội dung truyện");

    registerMutation.mutate(
      {
        title: trimmedTitle,
        author: trimmedAuthor,
        genreId: Number(genreId),
        description: description.trim(),
        coverImage: coverImage.trim(),
        content: trimmedContent,
        isShortStory,
      },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: () => {
          setFormError(
            "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  const handleReset = () => {
    setTitle("");
    setGenreId("");
    setDescription("");
    setCoverImage("");
    setContent("");
    setIsShortStory(false);
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-[#E5C88A] py-8 px-4 sm:px-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F7EAD3] border border-[#2D251E]/20 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#2D251E]">
              Đăng ký thành công!
            </h2>
            <p className="text-[#2D251E]/80 text-sm mt-3 leading-relaxed">
              Truyện tự kể của bạn đã được lưu vào hệ thống và đang chờ Ban quản
              trị duyệt. Truyện sẽ tự động hiển thị công khai ngay sau khi được
              duyệt thành công!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 rounded-xl font-semibold bg-[#2D251E] text-[#EEDCBE] hover:bg-[#1E2D3D] transition-colors cursor-pointer text-sm"
              >
                Về trang chủ
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl font-semibold border border-[#2D251E]/20 bg-white/40 text-[#2D251E] hover:bg-white/70 transition-colors cursor-pointer text-sm"
              >
                Viết truyện mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Container: Parchment Styled Page */}
      <div className="max-w-3xl mx-auto bg-[#F7EAD3] border-4 border-double border-[#2D251E]/30 rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#2D251E]/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#2D251E]/30 pointer-events-none" />

        {/* Title Block */}
        <div className="text-center mb-8 pb-4 border-b border-[#2D251E]/10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D251E] mt-2">
            Đăng Ký Viết Truyện
          </h1>
          <p className="text-[#2D251E]/60 text-xs sm:text-sm mt-1">
            Gửi câu chuyện tự kể của bạn để chia sẻ cùng cộng đồng độc giả
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tiêu đề */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2D251E]">
                Tiêu đề truyện *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề truyện..."
                className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
              />
            </div>

            {/* Tác giả */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2D251E]">
                Tác giả *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên tác giả..."
                className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Thể loại */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2D251E]">
                Thể loại *
              </label>
              <select
                value={genreId}
                onChange={(e) =>
                  setGenreId(e.target.value ? Number(e.target.value) : "")
                }
                className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm cursor-pointer"
              >
                <option value="">-- Chọn thể loại --</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Loại truyện */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2D251E]">
                Loại truyện *
              </label>
              <select
                value={isShortStory ? "true" : "false"}
                onChange={(e) => setIsShortStory(e.target.value === "true")}
                className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm cursor-pointer"
              >
                <option value="false">Truyện dài tập (nhiều chương)</option>
                <option value="true">Truyện ngắn (không chương)</option>
              </select>
            </div>
          </div>

          {/* URL ảnh bìa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#2D251E]">
              Link ảnh bìa (tùy chọn)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg..."
              className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
            />
          </div>

          {/* Tóm tắt truyện */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#2D251E]">
              Tóm tắt nội dung (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập đoạn giới thiệu ngắn cho truyện của bạn..."
              className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm resize-none"
            />
          </div>

          {/* Nội dung truyện */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#2D251E]">
              Nội dung câu chuyện *
            </label>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung câu chuyện của bạn vào đây..."
              className="px-4 py-3 rounded-xl border border-[#2D251E]/20 bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm font-serif"
            />
          </div>

          {/* Error Message */}
          {formError && (
            <p className="text-red-600 font-semibold text-sm text-center animate-shake">
              ⚠️ {formError}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#2D251E]/10">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all cursor-pointer text-sm shadow-md"
              style={{
                background: registerMutation.isPending
                  ? "#ccc"
                  : "linear-gradient(135deg, #1E2D3D, #2D251E)",
              }}
            >
              {registerMutation.isPending
                ? "Đang gửi truyện..."
                : "Gửi Đăng Ký 🚀"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl font-semibold border border-[#2D251E]/20 bg-white/40 text-[#2D251E] hover:bg-white/70 transition-colors cursor-pointer text-sm"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
