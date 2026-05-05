import { LAYOUT_CONSTANTS } from "@/common/constants/layout";
import { useResponsive } from "@/common/hooks/useResponsive";
import { Dropdown, Tooltip, type MenuProps } from "antd";
import {
  AlignJustify,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Maximize,
  Minimize,
  Package,
  Plus,
  Power,
  Search,
  Settings,
  User,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  onClickOpenMenu: () => void;
};

export default function Header({ onClickOpenMenu }: Props) {
  const { isMobile } = useResponsive();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  // Dropwdown menu items
  const dropdownItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: (
          <Link
            to="/profile-manager/detail?tab=personal-info"
            className="flex items-center gap-2 px-2"
          >
            <UserRound size={18} className="text-gray-700" />
            <span>Thông tin cá nhân</span>
          </Link>
        ),
        key: "profile",
      },
      {
        label: (
          <div
            // onClick={() => setModalChangePassword(true)}
            className="flex items-center gap-2 px-2"
          >
            <LockKeyhole size={18} className="text-gray-700" />
            <span>Đổi mật khẩu</span>
          </div>
        ),
        key: "change-password",
      },
      {
        label: (
          <Link to="/setting" className="flex items-center gap-2 px-2">
            <Settings size={18} className="text-gray-700" />
            <span>Cài đặt</span>
          </Link>
        ),
        key: "settings",
      },
      { type: "divider" },
      {
        label: (
          <div
            // onClick={showLogoutModal}
            className="flex items-center gap-2 px-2"
          >
            <Power size={18} className="text-gray-700" />
            <span>Đăng xuất</span>
          </div>
        ),
        key: "logout",
      },
    ],
    [],
  );
  return (
    <header
      className="sticky top-0 flex items-center justify-between px-4 lg:px-6 z-50 bg-[#2574c2] border-b border-b-[#d2d3d8] transition-colors duration-300"
      style={{
        height: `${LAYOUT_CONSTANTS.DIMENSIONS.HEADER_HEIGHT}px`,
      }}
    >
      <div className="flex justify-between items-center flex-1">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Tooltip arrow={false} title="Hiển thị menu">
              <div
                onClick={onClickOpenMenu}
                className="cursor-pointer hover:text-gray-500 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <AlignJustify size={18} />
              </div>
            </Tooltip>
          )}

          <Tooltip arrow={false} title="Quay lại">
            <div
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:text-gray-500 hover:bg-gray-200 rounded-full p-1 transition-colors"
            >
              <ChevronLeft size={24} />
            </div>
          </Tooltip>
          <Tooltip arrow={false} title="Chuyển tiếp">
            <div
              onClick={() => navigate(1)}
              className="cursor-pointer hover:text-gray-500 hover:bg-gray-200 rounded-full p-1 transition-colors"
            >
              <ChevronRight size={24} />
            </div>
          </Tooltip>
          <div
            className="hidden md:flex items-center w-50 bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 group"
            onClick={() => setIsSearchModalVisible(true)}
          >
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2 group-hover:text-blue-500 transition-colors" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-[#989898] dark:text-gray-400 text-sm flex-1">
                Tìm kiếm...
              </span>
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </div>
        {/* Right side actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden lg:block w-px h-6 bg-gray-200"></div>

          {/* Search button - Mobile */}
          <button
            onClick={() => setIsSearchModalVisible(true)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#144c65] dark:text-gray-300" />
          </button>

          {/* Quick Actions / Create */}
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "Tạo đơn hàng mới",
                  icon: <Package size={16} />,
                  onClick: () => navigate("/order-manager/create"),
                },
                {
                  key: "2",
                  label: "Thêm xe / chuyến",
                  icon: <Car size={16} />,
                  onClick: () =>
                    navigate("/vehicle-manager/list?action=create"),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Tooltip arrow={false} title="Tạo nhanh" placement="left">
              <button
                className="hidden sm:flex cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors items-center justify-center"
                aria-label="Quick Create"
              >
                <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </Tooltip>
          </Dropdown>

          {/* Fullscreen Toggle */}
          <Tooltip
            title={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
            placement="bottom"
          >
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors items-center justify-center"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </Tooltip>

          {/* Help / Support */}
          {/* <Tooltip title="Trợ giúp & Hướng dẫn" placement="bottom">
              <button
                onClick={() => navigate("/help-center")}
                className="hidden sm:flex cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors items-center justify-center"
                aria-label="Help"
              >
                <CircleHelp className="w-[20px] h-[20px] text-gray-700 dark:text-gray-300" />
              </button>
            </Tooltip> */}

          {/* Theme / Dark Mode Switcher */}
          {/* <Dropdown
              menu={{
                items: [
                  {
                    key: "light",
                    label: "Giao diện Sáng",
                    onClick: () => setTheme("light"),
                    icon: <Sun size={16} />,
                  },
                  {
                    key: "dark",
                    label: "Giao diện Tối",
                    onClick: () => setTheme("dark"),
                    icon: <Moon size={16} />,
                  },
                  {
                    key: "system",
                    label: "Tự động (Hệ thống)",
                    onClick: () => setTheme("system"),
                    icon: <Monitor size={16} />,
                  },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Tooltip title="Chế độ hiển thị" placement="bottom">
                <button
                  className="hidden sm:flex cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors items-center justify-center"
                  aria-label="Toggle Theme"
                >
                  {theme === "light" ? (
                    <Sun className="w-[20px] h-[20px] text-gray-700 dark:text-gray-300" />
                  ) : theme === "dark" ? (
                    <Moon className="w-[20px] h-[20px] text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Monitor className="w-[20px] h-[20px] text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              </Tooltip>
            </Dropdown> */}

          {/* Notifications Dropdown */}
          {/* <NotificationDropdown /> */}

          {/* User profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-90 transition-opacity"
              aria-label="User menu"
            >
              <User className="w-5 h-5" />
            </button>

            <Dropdown arrow menu={{ items: dropdownItems }}>
              <div className="flex items-center gap-2 justify-center cursor-pointer">
                <div className="hidden md:flex flex-col items-start dark:text-white">
                  <span className="text-[14px] font-semibold text-black dark:text-white">
                    LEE MIN HONG
                  </span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                    Admin
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <ChevronDown
                    size={16}
                    className="text-black dark:text-white"
                  />
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
