import { BREADCRUMB_NAME_MAPS } from "@/common/constants/breadcrumb";
import { Breadcrumb } from "antd";
import { ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const hiddenBreadcrumbPaths: string[] = [];

export default function BreadcrumbCustom() {
  const location = useLocation();
  const navigate = useNavigate();

  const shouldHide = hiddenBreadcrumbPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  if (shouldHide) {
    return null;
  }

  const pathSnippets = location.pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSnippets.reduce<
    { path: string; title: string }[]
  >((items, _, index) => {
    const url = "/" + pathSnippets.slice(0, index + 1).join("/");

    const matchedKey = Object.keys(BREADCRUMB_NAME_MAPS)
      .filter((key) => url.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];

    const title = BREADCRUMB_NAME_MAPS[matchedKey || ""];
    if (!title) {
      return items;
    }

    if (items.some((item) => item.title === title)) {
      return items;
    }

    return [...items, { path: url, title }];
  }, []);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb
      className="h-[48px] mb-6 rounded-3xl flex items-center [&_.ant-breadcrumb-separator]:flex [&_.ant-breadcrumb-separator]:items-center justify-between"
      separator={<ChevronRight />}
      items={breadcrumbItems.map((item, idx) => ({
        title:
          idx !== breadcrumbItems.length - 1 ? (
            <button
              onClick={() => navigate(item.path)}
              className="2xl:text-[16px] font-medium text-[14px] text-[#272727] cursor-pointer"
            >
              {item.title}
            </button>
          ) : (
            <span className="2xl:text-[18px] text-[14px] text-[#C2410C] font-semibold ">
              {item.title}
            </span>
          ),
      }))}
    />
  );
}
