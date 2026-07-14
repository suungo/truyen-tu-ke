import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getReaderId, getReaderName, setGuestReader, isReaderLoggedIn } from "@/apis/readers.api";
import UsernameModal from "../components/UsernameModal";
import StoryCard from "../components/StoryCard";
import { useStoriesQuery, useGenresQuery } from "../hooks/useStories";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [readerName, setReaderName] = useState<string | null>(null);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const {
    data,
    isLoading: isLoadingStories,
    isError: isErrorStories,
    refetch: refetchStories,
    isFetching: isFetchingStories,
  } = useStoriesQuery({
    page: currentPage,
    limit: 10,
    genreId: selectedGenreId,
    search: searchQuery,
  });

  const {
    data: genres = [],
    isLoading: isLoadingGenres,
    refetch: refetchGenres,
  } = useGenresQuery();

  useEffect(() => {
    const id = getReaderId();
    const name = getReaderName();
    if (!id) {
      setShowModal(true);
    } else {
      setReaderName(name);
    }
  }, []);

  const handleModalSubmit = async () => {
    setGuestReader();
    setReaderName("Khách");
    setShowModal(false);
  };

  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenreId(genreId);
    setCurrentPage(1); // Reset page on category filter change
  };

  const handleRetry = () => {
    refetchStories();
    refetchGenres();
  };

  const stories = data?.stories || [];
  const totalStories = data?.total || 0;
  const totalPages = Math.ceil(totalStories / 10);
  const isLoading = isLoadingStories || isLoadingGenres;

  return (
    <div className="min-h-screen bg-[#E5C88A]">
      {showModal && <UsernameModal onSubmit={handleModalSubmit} />}

      {/* Header section */}
      <div className="p-4 text-[#2D251E] rounded-2xl shadow-md parchment-banner border border-[#2D251E]/10">
        <div className="mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            {readerName && (
              <p className="text-[#2D251E]/80 text-sm mb-1">
                Xin chào,{" "}
                <span className="font-bold uppercase">{readerName}</span>
              </p>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2D251E]">
              Kho Truyện Tự Kể
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/register-story")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #C2410C, #EA580C)",
              }}
            >
              Đăng ký viết truyện
            </button>
            {isReaderLoggedIn() && (
              <button
                onClick={() => navigate("/submitted-stories")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#2D251E] bg-white/50 border border-[#2D251E]/20 hover:bg-white/80 shadow-md hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
              >
                Lịch sử đăng ký
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto p-4 grow flex flex-col justify-between min-h-[calc(100vh-220px)]">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 grow">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isErrorStories ? (
          <div className="text-center py-20 grow flex flex-col justify-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-[#2D251E]/80">
              Không thể tải danh sách truyện. Backend đang chạy chưa?
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 rounded-lg text-white font-semibold cursor-pointer mx-auto"
              style={{ background: "#1E2D3D" }}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grow flex flex-col justify-between">
            <div className="grow">
              {/* Bộ lọc thể loại */}
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <button
                  onClick={() => handleGenreChange(null)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    selectedGenreId === null
                      ? "bg-[#2D251E] text-[#EEDCBE] shadow-md"
                      : "bg-white/60 text-[#2D251E] hover:bg-white border border-[#2D251E]/10"
                  }`}
                >
                  Tất cả
                </button>
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGenreChange(g.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      selectedGenreId === g.id
                        ? "bg-[#2D251E] text-[#EEDCBE] shadow-md"
                        : "bg-white/60 text-[#2D251E] hover:bg-white border border-[#2D251E]/10"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {stories.length === 0 ? (
                <div className="text-center py-20 grow flex flex-col justify-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-[#2D251E] text-lg">Chưa có truyện nào.</p>
                  <p className="text-[#2D251E]/60 text-sm mt-1">
                    Admin hãy thêm truyện đầu tiên!
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-[#2D251E] mb-3 text-[16px] font-medium">
                    {totalStories} truyện đang có
                  </h3>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetchingStories ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
                    {stories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onClick={() => navigate(`/stories/${story.id}`)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Phân trang */}
      {totalStories > 0 && (
        <div className="flex items-center justify-end gap-2 mt-16 pb-4 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#2D251E]/10 bg-white/60 text-[#2D251E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all cursor-pointer"
          >
            ← Trước
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentPage === pageNumber
                    ? "bg-[#2D251E] text-[#EEDCBE] shadow-md"
                    : "border border-[#2D251E]/10 bg-white/60 text-[#2D251E] hover:bg-white"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#2D251E]/10 bg-white/60 text-[#2D251E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all cursor-pointer"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
