import { Menu as AntMenu, Layout, type MenuProps } from "antd";
import { BarChart3, BookOpen, Tags, CheckSquare, BookMarked, Users, Bell, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type IconComponent = React.ComponentType<{
  className?: string;
  size?: string | number;
}>;

const iconMap: Record<string, IconComponent> = {
  dashboard: BarChart3,
  stories: BookOpen,
  genres: Tags,
  "pending-stories": CheckSquare,
  frameworks: BookMarked,
  readers: Users,
  notifications: Bell,
  "video-generator": Video,
};

// Mapping từ menu key đến route
const routeMap: Record<string, string> = {
  dashboard: "/dashboard",
  stories: "/stories",
  genres: "/genres",
  "pending-stories": "/stories/pending",
  frameworks: "/frameworks",
  readers: "/readers",
  notifications: "/notifications",
  "video-generator": "/video-generator",
};

export default function Menu() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigate = useCallback(
    (to: string) => {
      if (pathname !== to) {
        navigate(to);
      }
    },
    [navigate, pathname],
  );

  // Xác định key đang chọn
  const selectedKey = useMemo(() => {
    const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    // Navigation handler - loại bỏ debounce để tránh độ trễ

    const routeMapping: Record<string, string> = {
      dashboard: "dashboard",
      stories: "stories",
      "stories/create": "stories",
      genres: "genres",
      "stories/pending": "pending-stories",
      frameworks: "frameworks",
      "frameworks/create": "frameworks",
      readers: "readers",
      notifications: "notifications",
      "video-generator": "video-generator",
    };

    if (routeMapping[cleanPath]) {
      return routeMapping[cleanPath];
    }

    // Danh sách các route cha có trong menu
    const partialMatches = ["dashboard", "stories", "genres", "pending-stories", "frameworks", "readers", "notifications", "video-generator"];

    const partialMatch = partialMatches.find((key) => cleanPath.includes(key));
    return partialMatch || cleanPath;
  }, [pathname]);

  // Xác định key cha cần mở (nếu có)
  const openKey = useMemo(() => {
    if (selectedKey.startsWith("employee-manager")) return "employee-manager";
    if (selectedKey.startsWith("order-manager")) return "order-manager";
    return "";
  }, [selectedKey]);

  // Trạng thái openKeys
  const [openKeys, setOpenKeys] = useState<string[]>(openKey ? [openKey] : []);

  // Cập nhật openKeys mỗi khi route thay đổi
  useEffect(() => {
    if (openKey) {
      setOpenKeys([openKey]);
    } else {
      setOpenKeys([]);
    }
  }, [openKey]);

  // Hàm mở menu cha khi người dùng click
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Handler khi click vào menu item (bao gồm icon và label)
  const handleMenuClick = useCallback(
    (info: { key: string }) => {
      const route = routeMap[info.key];
      if (route) {
        navigate(route);
      }
    },
    [navigate],
  );

  // Helper function để render icon với transition mượt mà
  const renderIcon = useCallback(
    (key: string) => {
      const IconComponent = iconMap[key];
      if (!IconComponent) return null;
      const isActive = selectedKey.includes(key) || selectedKey === key;
      return (
        <IconComponent
          className={`transition-colors duration-200 ${
            isActive ? "text-white" : "text-gray-600"
          }`}
          size={20}
        />
      );
    },
    [selectedKey],
  );

  // Menu items dựa trên permissionCodes từ API accounts/profile (canAccessRoute dùng can(permission))
  const items: MenuProps["items"] = useMemo(
    () =>
      [
        {
          key: "dashboard",
          icon: renderIcon("dashboard"),
          label: (
            <div
              onClick={() => handleNavigate("/dashboard")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Tổng quan
            </div>
          ),
        },
        {
          key: "stories",
          icon: renderIcon("stories"),
          label: (
            <div
              onClick={() => handleNavigate("/stories")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý Truyện
            </div>
          ),
        },
        {
          key: "pending-stories",
          icon: renderIcon("pending-stories"),
          label: (
            <div
              onClick={() => handleNavigate("/stories/pending")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý kịch bản
            </div>
          ),
        },
        {
          key: "genres",
          icon: renderIcon("genres"),
          label: (
            <div
              onClick={() => handleNavigate("/genres")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý thể loại
            </div>
          ),
        },
        {
          key: "frameworks",
          icon: renderIcon("frameworks"),
          label: (
            <div
              onClick={() => handleNavigate("/frameworks")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý Khung kịch bản
            </div>
          ),
        },
        {
          key: "readers",
          icon: renderIcon("readers"),
          label: (
            <div
              onClick={() => handleNavigate("/readers")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý Độc giả
            </div>
          ),
        },
        {
          key: "notifications",
          icon: renderIcon("notifications"),
          label: (
            <div
              onClick={() => handleNavigate("/notifications")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý Thông báo
            </div>
          ),
        },
        {
          key: "video-generator",
          icon: renderIcon("video-generator"),
          label: (
            <div
              onClick={() => handleNavigate("/video-generator")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Tạo Video
            </div>
          ),
        },
      ].filter(Boolean) as MenuProps["items"],
    [handleNavigate, renderIcon],
  );
  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value: boolean) => setCollapsed(value)}
      theme="light"
      width={298}
      className="py-2 fixed left-0 top-0 bottom-0 z-40 border-r border-r-[#d2d3d8] dark:border-r-gray-800 transition-colors duration-300"
    >
      <div className="flex justify-center items-center mb-2">
        <img
          security="true"
          loading="lazy"
          src={"/image-logo.png"}
          alt="logo"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "h-[40px] w-auto" : "h-[80px] w-auto"
          }`}
        />
      </div>
      <AntMenu
        className={`h-[calc(100vh-160px)] overflow-y-auto`}
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        mode="inline"
        items={items}
      />
    </Layout.Sider>
  );
}
