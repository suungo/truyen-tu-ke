import BreadcrumbCustom from "@/common/components/base/breadcrumbCustom";
import { BREADCRUMB_NAME_MAPS } from "@/common/constants/breadcrumb";
import { LAYOUT_CONSTANTS } from "@/common/constants/layout";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./footer";
import Header from "./header";
import Menu from "./menu";

export default function DefaultLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClickOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleClickOnClose = () => {
    setIsMenuOpen(false);
  };

  // Memoize để không recompute mỗi render — chỉ recompute khi pathname thay đổi
  const showBreadcrumb = useMemo(() => {
    const pathSnippets = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = pathSnippets.reduce<
      { path: string; title: string }[]
    >((items, _, index) => {
      const url = "/" + pathSnippets.slice(0, index + 1).join("/");
      const matchedKey = Object.keys(BREADCRUMB_NAME_MAPS)
        .filter((key) => url.startsWith(key))
        .sort((a, b) => b.length - a.length)[0];
      const title = BREADCRUMB_NAME_MAPS[matchedKey || ""];
      if (!title || items.some((item) => item.title === title)) return items;
      return [...items, { path: url, title }];
    }, []);
    return breadcrumbItems.length > 0;
  }, [location.pathname]);

  return (
    <>
      <div className="h-screen w-full">
        <div className="flex">
          {/* Menu component */}
          {isMobile ? (
            <div
              className={`fixed inset-0 z-50 transition-opacity duration-300 ${
                isMenuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
                  isMenuOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleClickOnClose}
              />
              <div
                className="fixed left-0 top-0 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out"
                style={{
                  zIndex: LAYOUT_CONSTANTS.Z_INDEX.DRAWER_CONTENT,
                  transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
                }}
              >
                <div className="flex justify-end p-4 border-b">
                  <X
                    className="cursor-pointer"
                    onClick={handleClickOnClose}
                    size={24}
                  />
                </div>
                <div className="">
                  <Menu />
                </div>
              </div>
            </div>
          ) : (
            <aside className="">
              <Menu />
            </aside>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Header component */}
            <Header onClickOpenMenu={handleClickOpenMenu} />
            {/* Main content component */}
            <main className="flex-1 overflow-x-hidden" ref={contentRef}>
              <div className="z-30 px-6 bg-white border-b border-gray-200 transition-colors duration-300">
                {showBreadcrumb && <BreadcrumbCustom />}
              </div>

              <div
                className="flex-1 px-5 pt-2 pb-0 overflow-y-auto bg-gray-50 transition-colors duration-300"
                style={{
                  height: `calc(100vh - ${
                    LAYOUT_CONSTANTS.DIMENSIONS.HEADER_HEIGHT +
                    LAYOUT_CONSTANTS.DIMENSIONS.BREADCRUMN_HEIGHT
                  }px)`,
                }}
              >
                {/* <RouteGuard> */}{" "}
                {/* Dùng để kiểm tra quyền truy cập trước khi render */}
                <Outlet />
                {/* </RouteGuard> */}
                <Footer />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
