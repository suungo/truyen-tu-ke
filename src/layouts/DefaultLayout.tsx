import BreadcrumbCustom from "@/common/components/base/breadcrumbCustom";
import { BREADCRUMB_NAME_MAPS } from "@/common/constants/breadcrumb";
import { LAYOUT_CONSTANTS } from "@/common/constants/layout";
import { useEffect, useMemo, useRef } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./footer";
import Header from "./header";
import { logVisit } from "@/apis/stories.api";

export default function DefaultLayout() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasLogged = sessionStorage.getItem("has_logged_visit");
    if (!hasLogged) {
      logVisit()
        .then(() => {
          sessionStorage.setItem("has_logged_visit", "true");
        })
        .catch(() => {});
    }
  }, []);

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
      <div className="bg-[#EEDCBE] min-h-screen">
        <div className="h-screen max-w-[1200px] mx-auto bg-[#E5C88A] shadow-2xl flex flex-col">
          {/* Header component */}
          <Header />
          {/* Main content component */}
          <main
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
            ref={contentRef}
          >
            <div className="z-30 px-4 sm:px-6 bg-[#E5C88A] border-b border-[#EEDCBE]/30 transition-colors duration-300">
              {showBreadcrumb && <BreadcrumbCustom />}
            </div>

            <div
              className="flex-1 px-3 sm:px-5 pt-4 pb-0 overflow-y-auto hide-scrollbar bg-[#E5C88A] transition-colors duration-300"
              style={{
                height: `calc(100vh - ${
                  LAYOUT_CONSTANTS.DIMENSIONS.HEADER_HEIGHT +
                  (showBreadcrumb
                    ? LAYOUT_CONSTANTS.DIMENSIONS.BREADCRUMN_HEIGHT
                    : 0)
                }px)`,
              }}
            >
              {/* <RouteGuard> */}
              {/* Dùng để kiểm tra quyền truy cập trước khi render */}
              <Outlet />
              {/* </RouteGuard> */}
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
