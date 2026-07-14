import { LAYOUT_CONSTANTS } from "@/common/constants/layout";
import { Input, Tooltip, Popover, Modal, message } from "antd";
import { ChevronLeft, ChevronRight, Maximize, Minimize, User, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStories } from "@/apis/stories.api";
import useDebounce from "@/common/hooks/useDebounce";
import {
  isReaderLoggedIn,
  getReaderName,
  getReaderEmail,
  clearReaderSession,
  getReaderId,
  updateReaderInfo,
} from "@/apis/readers.api";
import { useNotifications } from "@/common/hooks/useNotifications";

export default function Header() {
  const [isFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: suggestionData, isFetching: isSearching } = useQuery({
    queryKey: ["search-suggestions", debouncedSearch],
    queryFn: () => getStories({ search: debouncedSearch, limit: 10 }),
    enabled: debouncedSearch.trim().length >= 1,
  });

  const suggestions = suggestionData?.stories || [];

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    setShowDropdown(false);
    if (trimmed) {
      navigate(`/dashboard?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    clearReaderSession();
    navigate("/dashboard");
    window.location.reload();
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isProfileModalOpen) {
      setEditName(getReaderName() || "");
      setEditEmail(getReaderEmail() || "");
    }
  }, [isProfileModalOpen]);

  const handleUpdateProfile = async () => {
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedName) {
      message.error("Tên độc giả không được để trống");
      return;
    }
    if (!trimmedEmail) {
      message.error("Email không được để trống");
      return;
    }

    setUpdating(true);
    try {
      const readerId = getReaderId();
      if (!readerId) throw new Error("Chưa đăng nhập");

      await updateReaderInfo(Number(readerId), trimmedName, trimmedEmail);
      message.success("Cập nhật thông tin thành công!");
      setIsProfileModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };

  const profileContent = (
    <div className="p-1 space-y-1 w-48 text-[#2D251E]">
      <button
        onClick={() => setIsProfileModalOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#2D251E]/5 rounded-lg transition-colors cursor-pointer text-left"
      >
        <User size={14} />
        <span>Thông tin cá nhân</span>
      </button>
      <div className="h-px bg-[#2D251E]/10 my-1" />
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
      >
        <LogOut size={14} />
        <span>Đăng xuất</span>
      </button>
    </div>
  );

  const { notifications, unreadCount, handleRead } = useNotifications();

  const notificationContent = (
    <div className="w-72 text-[#2D251E] flex flex-col max-h-80">
      <div className="p-3 border-b border-[#2D251E]/10 font-bold flex justify-between items-center bg-[#F7EAD3]/40">
        <span>Thông báo mới</span>
        {unreadCount > 0 && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>
      <div className="overflow-y-auto divide-y divide-[#2D251E]/5 grow">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#2D251E]/50">
            Chưa có thông báo nào.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleRead(n.id)}
              className={`p-3 text-xs cursor-pointer hover:bg-[#2D251E]/5 transition-colors ${
                !n.isRead ? "bg-amber-50/70 font-semibold" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[#2D251E] truncate max-w-[85%]">{n.title}</span>
                {!n.isRead && <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0 mt-1" />}
              </div>
              <p className="text-[#2D251E]/70 mt-1 line-clamp-3">{n.content}</p>
              <span className="text-[10px] text-[#2D251E]/40 mt-1 block">
                {new Date(n.createdAt).toLocaleDateString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <header
      className="sticky top-0 flex items-center justify-between px-4 lg:px-6 z-50 bg-[#EEDCBE] border-b border-b-[#2D251E]/10 transition-colors duration-300"
      style={{
        height: `${LAYOUT_CONSTANTS.DIMENSIONS.HEADER_HEIGHT}px`,
      }}
    >
      <div className="flex justify-between items-center flex-1">
        <div className="flex items-center gap-2 flex-1 mr-4">
          <Link to="/dashboard" className="flex items-center mr-1">
            <img
              src="/image-logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border border-[#2D251E]/15 shadow-sm hover:scale-105 transition-transform"
            />
          </Link>

          <Tooltip arrow={false} title="Quay lại">
            <div
              onClick={() => navigate(-1)}
              className="hidden sm:flex cursor-pointer text-[#2D251E] hover:bg-[#2D251E]/10 rounded-full p-1 transition-colors"
            >
              <ChevronLeft size={24} />
            </div>
          </Tooltip>
          <Tooltip arrow={false} title="Chuyển tiếp">
            <div
              onClick={() => navigate(1)}
              className="hidden sm:flex cursor-pointer text-[#2D251E] hover:bg-[#2D251E]/10 rounded-full p-1 transition-colors"
            >
              <ChevronRight size={24} />
            </div>
          </Tooltip>
          <div className="flex-1 sm:flex-initial sm:w-52 md:w-64 transition-all duration-300 relative">
            <Input.Search
              placeholder="Tìm kiếm"
              className="w-full rounded-xl transition-all duration-200 group"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setShowDropdown(false)}
              onSearch={handleSearch}
              allowClear
            />
            {showDropdown && debouncedSearch.trim().length >= 1 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FDFBF7] border border-[#2D251E]/15 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-[#2D251E]/5">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-[#2D251E]/60">
                    Đang tìm kiếm...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#2D251E]/60">
                    Không tìm thấy truyện nào
                  </div>
                ) : (
                  suggestions.map((story) => (
                    <div
                      key={story.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => {
                        navigate(`/stories/${story.id}`);
                        setShowDropdown(false);
                        setSearchValue("");
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#2D251E]/5 cursor-pointer transition-colors"
                    >
                      {story.coverImage ? (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-9 h-12 object-cover rounded-lg border border-[#2D251E]/10 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-[#2D251E]/10 text-xs shrink-0">
                          📖
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#2D251E] truncate">
                          {story.title}
                        </div>
                        <div className="text-xs text-[#2D251E]/60 truncate">
                          Tác giả: {story.author}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right side actions */}
        <div className="flex items-center gap-3 lg:gap-4 animate-fadeIn">
          <div className="hidden lg:block w-px h-6 bg-[#2D251E]/10"></div>

          {/* Fullscreen Toggle */}
          <Tooltip
            title={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
            placement="bottom"
          >
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex cursor-pointer p-2 hover:bg-[#2D251E]/10 rounded-lg transition-colors items-center justify-center"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-[#2D251E]" />
              ) : (
                <Maximize className="w-5 h-5 text-[#2D251E]" />
              )}
            </button>
          </Tooltip>

          {/* Bell Icon (Only for logged in readers) */}
          {isReaderLoggedIn() && (
            <Popover
              content={notificationContent}
              trigger="hover"
              placement="bottomRight"
              arrow={false}
            >
              <div className="relative cursor-pointer p-2 hover:bg-[#2D251E]/10 rounded-lg transition-colors items-center justify-center flex mr-1.5">
                <Bell className="w-5 h-5 text-[#2D251E]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
            </Popover>
          )}

          {isReaderLoggedIn() ? (
            <Popover
              content={profileContent}
              trigger="click"
              placement="bottomRight"
              arrow={false}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-[#2D251E]/5 hover:bg-[#2D251E]/10 px-3 py-1.5 rounded-full border border-[#2D251E]/10">
                <div className="w-6 h-6 rounded-full bg-[#1E2D3D] text-[#EEDCBE] flex items-center justify-center font-bold text-xs">
                  {getReaderName()?.charAt(0).toUpperCase() || "D"}
                </div>
                <span className="hidden sm:block text-xs font-bold text-[#2D251E] truncate max-w-24">
                  {getReaderName()}
                </span>
              </div>
            </Popover>
          ) : (
            <button
              onClick={() => navigate("/auth/login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2D251E] bg-[#2D251E]/5 hover:bg-[#2D251E]/15 border border-[#2D251E]/10 transition-all cursor-pointer"
            >
              <User size={14} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>

      <Modal
        title={
          <div className="text-[#2D251E] font-bold text-lg border-b border-[#2D251E]/10 pb-2">
            👤 Thông tin cá nhân
          </div>
        }
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        width={400}
        centered
        styles={{
          body: {
            backgroundColor: "#F7EAD3",
            color: "#2D251E",
          },
          header: {
            backgroundColor: "#F7EAD3",
            color: "#2D251E",
          }
        }}
      >
        <div className="space-y-4 pt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">Tên độc giả</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập tên độc giả..."
              className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#2D251E]/80">Email độc giả</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="nhap.email@cua.ban"
              className="w-full px-4 py-3 border border-[#2D251E]/20 rounded-xl bg-white/70 text-[#2D251E] outline-none focus:bg-white focus:border-[#2D251E] transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 py-2.5 border border-[#2D251E]/20 text-[#2D251E] rounded-xl text-xs font-bold hover:bg-[#2D251E]/5 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateProfile}
              disabled={updating}
              className="flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #1E2D3D, #2D251E)",
              }}
            >
              {updating ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
