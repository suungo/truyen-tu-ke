import { Menu as AntMenu, Layout, type MenuProps } from "antd";
import { BarChart3, Package, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type IconComponent = React.ComponentType<{
  className?: string;
  size?: string | number;
}>;

const iconMap: Record<string, IconComponent> = {
  dashboard: BarChart3,
  "branch-manager": Package,
  "customer-manager": Users,
};

// Mapping từ menu key đến route
const routeMap: Record<string, string> = {
  dashboard: "/dashboard",
  "branch-manager": "/branch-manager/list",
  "customer-manager": "/customer-manager/list",
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
      "branch-manager": "branch-manager",
      "branch-manager/list": "branch-manager",
      "branch-manager/detail": "branch-manager",
      "branch-manager/create": "branch-manager",
      "branch-manager/edit": "branch-manager",
      "customer-manager": "customer-manager",
      "customer-manager/list": "customer-manager",
      "customer-manager/detail": "customer-manager",
      "customer-manager/create": "customer-manager",
      "customer-manager/edit": "customer-manager",
    };

    if (routeMapping[cleanPath]) {
      return routeMapping[cleanPath];
    }

    if (
      cleanPath.startsWith("order-manager/detail/") ||
      cleanPath.startsWith("order-manager/edit/")
    ) {
      return "order-manager/list";
    }

    // Danh sách các route cha có trong menu
    const partialMatches = ["dashboard", "branch-manager", "customer-manager"];

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
        navigate("/dashboard") && {
          key: "dashboard",
          icon: renderIcon("dashboard"),
          label: (
            <div
              onClick={() => handleNavigate("/dashboard")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Báo cáo thống kê
            </div>
          ),
        },

        navigate("/branch-manager/list") && {
          key: "branch-manager",
          icon: renderIcon("branch-manager"),
          label: (
            <div
              onClick={() => handleNavigate("/branch-manager/list")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý bưu cục
            </div>
          ),
        },

        navigate("/customer-manager/list") && {
          key: "customer-manager",
          icon: renderIcon("customer-manager"),
          label: (
            <div
              onClick={() => handleNavigate("/customer-manager/list")}
              className="cursor-pointer text-[16px] font-medium"
            >
              Quản lý khách hàng
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
          src={collapsed ? "/logo-url.png" : "/logo-shipup.png"}
          alt="logo"
          onError={(e) => {
            // Fallback nếu logo dark chưa có
            e.currentTarget.src = collapsed
              ? "/logo-url.png"
              : "/logo-shipup.png";
          }}
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
