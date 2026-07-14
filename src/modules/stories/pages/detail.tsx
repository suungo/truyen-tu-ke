import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useStoryDetailQuery,
  useChaptersQuery,
  useStoryFrameworkQuery,
} from "../../dashboarch/hooks/useStories";
import { getChapterDetail } from "@/apis/stories.api";
import { useSpeechSynthesis } from "../hook/useSpeechSynthesis";
import StoryCharactersSetting from "../components/StoryCharactersSetting";
import VoiceSelectionModal from "../components/VoiceSelectionModal";
import {
  BookOpen,
  Eye,
  Calendar,
  Square,
  ArrowLeft,
  Headphones,
} from "lucide-react";

interface Chapter {
  id: number;
  storyId: number;
  chapterNumber: number;
  title: string;
  synopsis?: string;
  content: string;
  views: number;
  createdAt: string;
}

const normalizeText = (text?: string) => {
  if (!text) return "";
  let normalized = text.normalize("NFC");

  // Fix spacing accents (´ and `)
  // 1. If preceded by a vowel that already has the tone mark, remove the extra spacing tone mark
  normalized = normalized.replace(
    /([áàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẤẦẨẪẬẮẰẲẴẶÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ])\s*[´ˊ]/g,
    "$1",
  );
  normalized = normalized.replace(
    /([áàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẤẦẨẪẬẮẰẲẴẶÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ])\s*[`ˋ]/g,
    "$1",
  );

  // 2. If preceded by a base vowel, combine them
  normalized = normalized
    .replace(/ă\s*[´ˊ]/g, "ắ")
    .replace(/Ă\s*[´ˊ]/g, "Ắ")
    .replace(/ă\s*[`ˋ]/g, "ằ")
    .replace(/Ă\s*[`ˋ]/g, "Ằ")
    .replace(/â\s*[´ˊ]/g, "ấ")
    .replace(/Â\s*[´ˊ]/g, "Ấ")
    .replace(/â\s*[`ˋ]/g, "ầ")
    .replace(/Â\s*[`ˋ]/g, "Ầ")
    .replace(/ê\s*[´ˊ]/g, "ế")
    .replace(/Ê\s*[´ˊ]/g, "Ế")
    .replace(/ê\s*[`ˋ]/g, "ề")
    .replace(/Ê\s*[`ˋ]/g, "Ề")
    .replace(/ô\s*[´ˊ]/g, "ố")
    .replace(/Ô\s*[´ˊ]/g, "Ố")
    .replace(/ô\s*[`ˋ]/g, "ồ")
    .replace(/Ô\s*[`ˋ]/g, "Ồ")
    .replace(/ơ\s*[´ˊ]/g, "ớ")
    .replace(/Ơ\s*[´ˊ]/g, "Ớ")
    .replace(/ơ\s*[`ˋ]/g, "ờ")
    .replace(/Ơ\s*[`ˋ]/g, "Ờ")
    .replace(/ư\s*[´ˊ]/g, "ứ")
    .replace(/Ư\s*[´ˊ]/g, "Ứ")
    .replace(/ư\s*[`ˋ]/g, "ừ")
    .replace(/Ư\s*[`ˋ]/g, "Ừ")
    .replace(/a\s*[´ˊ]/g, "á")
    .replace(/A\s*[´ˊ]/g, "Á")
    .replace(/a\s*[`ˋ]/g, "à")
    .replace(/A\s*[`ˋ]/g, "À")
    .replace(/e\s*[´ˊ]/g, "é")
    .replace(/E\s*[´ˊ]/g, "É")
    .replace(/e\s*[`ˋ]/g, "è")
    .replace(/E\s*[`ˋ]/g, "È")
    .replace(/i\s*[´ˊ]/g, "í")
    .replace(/I\s*[´ˊ]/g, "Í")
    .replace(/i\s*[`ˋ]/g, "ì")
    .replace(/I\s*[`ˋ]/g, "Ì")
    .replace(/o\s*[´ˊ]/g, "ó")
    .replace(/O\s*[´ˊ]/g, "Ó")
    .replace(/o\s*[`ˋ]/g, "ò")
    .replace(/O\s*[`ˋ]/g, "Ò")
    .replace(/u\s*[´ˊ]/g, "ú")
    .replace(/U\s*[´ˊ]/g, "Ú")
    .replace(/u\s*[`ˋ]/g, "ù")
    .replace(/U\s*[`ˋ]/g, "Ù")
    .replace(/y\s*[´ˊ]/g, "ý")
    .replace(/Y\s*[´ˊ]/g, "Ý")
    .replace(/y\s*[`ˋ]/g, "ỳ")
    .replace(/Y\s*[`ˋ]/g, "Ỳ");

  return normalized;
};

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: story,
    isLoading: isLoadingStory,
    isError: isErrorStory,
  } = useStoryDetailQuery(Number(id));
  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    refetch: refetchChapters,
  } = useChaptersQuery(Number(id));
  const { data: framework } = useStoryFrameworkQuery(Number(id));

  const { speak, speaking, cancel, voices } = useSpeechSynthesis();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedReadChapter, setSelectedReadChapter] =
    useState<Chapter | null>(null);
  const [readingModalOpen, setReadingModalOpen] = useState(false);

  useEffect(() => {
    cancel();
    return () => {
      cancel();
    };
  }, [id, cancel]);

  const handlePlayAudio = () => {
    const textToRead = selectedReadChapter
      ? selectedReadChapter.content
      : story?.isShortStory
        ? story.content
        : null;
    if (!textToRead) return;
    if (speaking) {
      cancel();
    } else {
      setVoiceModalOpen(true);
    }
  };

  const handleStartSpeaking = (voice: SpeechSynthesisVoice | null) => {
    const textToRead = selectedReadChapter
      ? selectedReadChapter.content
      : story?.isShortStory
        ? story.content
        : null;
    if (!textToRead) return;
    speak({ text: normalizeText(textToRead), voice });
    setVoiceModalOpen(false);
  };

  const openReading = async (ch: Chapter) => {
    try {
      const detail = await getChapterDetail(ch.storyId, ch.chapterNumber);
      setSelectedReadChapter(detail);
      setReadingModalOpen(true);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết tập:", err);
    }
  };

  const closeReading = () => {
    cancel();
    setReadingModalOpen(false);
    setSelectedReadChapter(null);
    refetchChapters();
  };

  const isLoading = isLoadingStory || isLoadingChapters;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E5C88A] p-6">
        <div className="max-w-6xl mx-auto animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-64 bg-black/10 rounded-2xl" />
            <div className="h-6 bg-black/10 rounded w-2/3" />
            <div className="h-4 bg-black/10 rounded w-1/3" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-black/10 rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-black/10 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isErrorStory || !story) {
    return (
      <div className="min-h-screen bg-[#E5C88A] flex flex-col items-center justify-center p-6 text-[#2D251E]">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold">
          Truyện không tồn tại hoặc đã bị xóa
        </h2>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2.5 rounded-xl text-[#EEDCBE] bg-[#2D251E] font-bold shadow-md hover:scale-102 transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const chapters: Chapter[] = chaptersData?.chapters || [];
  const publishedCount = chapters.length;
  const expectedCount = framework?.totalEpisodes || 0;

  return (
    <div className="min-h-screen bg-[#E5C88A] text-[#2D251E]">
      {/* Back button */}

      <div className="p-4 space-y-6">
        {/* Story Info Card */}
        <div className="w-full">
          <div className="bg-white/60 border border-[#2D251E]/10 rounded-2xl overflow-hidden shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {story.coverImage && (
                <div className="rounded-xl overflow-hidden shadow-inner shrink-0 w-full md:w-56 aspect-3/4">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-1 text-[#2D251E]">
                    {normalizeText(story.title)}
                  </h1>
                  <p className="text-sm font-semibold text-[#2D251E]/60 mb-3">
                    ✍️ {normalizeText(story.author)}
                  </p>

                  {/* Published progress */}
                  {!story.isShortStory && (
                    <div className="bg-white/40 border border-[#2D251E]/5 rounded-xl p-3 mb-4 max-w-md">
                      <div className="flex justify-between text-xs font-bold text-[#2D251E]/70 mb-1">
                        <span>TIẾN ĐỘ XUẤT BẢN</span>
                        <span>
                          {publishedCount}/{expectedCount || "?"} tập
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-orange-600 to-amber-500 rounded-full"
                          style={{
                            width: `${expectedCount > 0 ? (publishedCount / expectedCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {story.description && (
                    <div className="text-sm leading-relaxed text-[#2D251E]/80 italic border-l-4 border-[#2D251E]/40 pl-3 mb-4">
                      {normalizeText(story.description)}
                    </div>
                  )}
                </div>

                <StoryCharactersSetting
                  characters={normalizeText(story.characters)}
                  setting={normalizeText(story.setting)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chapters list or Short Story Content */}
        <div className="w-full space-y-4">
          {story.isShortStory ? (
            <div className="bg-[#F5EAD4] border-2 border-[#2D251E]/20 rounded-2xl shadow-md flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2D251E]/10 flex items-center justify-between bg-[#EEDCBE]/30">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <BookOpen size={20} />
                  NỘI DUNG TRUYỆN
                </h2>
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D251E] hover:bg-orange-700 text-[#EEDCBE] hover:text-white transition-colors cursor-pointer text-xs font-black shadow-md"
                >
                  {speaking ? (
                    <>
                      <Square
                        size={13}
                        className="text-red-400 animate-pulse"
                      />
                      <span>Dừng đọc</span>
                    </>
                  ) : (
                    <>
                      <Headphones size={13} />
                      <span>Nghe đọc</span>
                    </>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 font-sans text-lg leading-relaxed text-[#2D251E]/95 whitespace-pre-wrap selection:bg-[#EEDCBE] min-h-[400px]">
                {normalizeText(story.content)}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-[#2D251E]/10 bg-[#EEDCBE]/30 flex items-center justify-between text-xs text-[#2D251E]/50">
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {story.views ?? 0} lượt xem
                </span>
                <span className="font-bold">
                  ~{story.content?.split(/\s+/).filter(Boolean).length || 0} từ
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 border border-[#2D251E]/10 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between border-b border-[#2D251E]/10 pb-4 mb-4">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <BookOpen size={20} />
                  DANH SÁCH TẬP ({publishedCount})
                </h2>
                {expectedCount > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-800 font-black px-3 py-1 rounded-full border border-orange-200">
                    {publishedCount >= expectedCount ? "Trọn bộ" : "Đang ra"}
                  </span>
                )}
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-16 text-[#2D251E]/50">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="font-semibold">Chưa có tập nào được xuất bản</p>
                  <p className="text-xs mt-1">Độc giả vui lòng quay lại sau</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="group bg-white/50 hover:bg-white rounded-xl border border-[#2D251E]/5 hover:border-[#2D251E]/15 p-4 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer"
                      onClick={() => openReading(ch)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] bg-[#2D251E] text-[#EEDCBE] px-2 py-0.5 rounded font-black">
                            TẬP {ch.chapterNumber}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#2D251E]/40 font-medium">
                            <Eye size={10} />
                            {ch.views}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#2D251E] group-hover:text-orange-700 transition-colors line-clamp-1 mb-1.5">
                          {normalizeText(ch.title)}
                        </h3>
                        {ch.synopsis && (
                          <p className="text-xs text-[#2D251E]/60 line-clamp-2 leading-relaxed mb-3">
                            {normalizeText(ch.synopsis)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2D251E]/5 mt-auto">
                        <span className="flex items-center gap-1 text-[10px] text-[#2D251E]/40">
                          <Calendar size={10} />
                          {new Date(ch.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReading(ch);
                          }}
                          className="px-3 py-1 bg-[#2D251E] hover:bg-orange-700 text-[#EEDCBE] hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Đọc ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Reading Modal ── */}
      {readingModalOpen && selectedReadChapter && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5EAD4] border-2 border-[#2D251E]/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2D251E]/10 flex items-center justify-between bg-[#EEDCBE]/30 shrink-0">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-black text-[#2D251E]/50 block tracking-wider">
                  {normalizeText(story.title)}
                </span>
                <h3 className="font-black text-[#2D251E] text-base truncate">
                  Tập {selectedReadChapter.chapterNumber}:{" "}
                  {normalizeText(selectedReadChapter.title)}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D251E] hover:bg-orange-700 text-[#EEDCBE] hover:text-white transition-colors cursor-pointer text-xs font-black shadow-md"
                >
                  {speaking ? (
                    <>
                      <Square
                        size={13}
                        className="text-red-400 animate-pulse"
                      />
                      <span>Dừng đọc</span>
                    </>
                  ) : (
                    <>
                      <Headphones size={13} />
                      <span>Nghe đọc</span>
                    </>
                  )}
                </button>
                <button
                  onClick={closeReading}
                  className="w-8 h-8 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-700 cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Reading Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans text-lg leading-relaxed text-[#2D251E]/95 whitespace-pre-wrap selection:bg-[#EEDCBE]">
              {normalizeText(selectedReadChapter.content)}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#2D251E]/10 bg-[#EEDCBE]/30 flex items-center justify-between text-xs text-[#2D251E]/50 shrink-0">
              <span className="flex items-center gap-1.5">
                <Eye size={12} />
                {selectedReadChapter.views} lượt xem
              </span>
              <span className="font-bold">
                ~
                {selectedReadChapter.content?.split(/\s+/).filter(Boolean)
                  .length || 0}{" "}
                từ
              </span>
            </div>
          </div>
        </div>
      )}

      <VoiceSelectionModal
        open={voiceModalOpen}
        onCancel={() => setVoiceModalOpen(false)}
        onStartSpeaking={handleStartSpeaking}
        voices={voices}
      />
    </div>
  );
}
