import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const FrameworkListPage = React.lazy(
  () => import("@/modules/framework/pages/list"),
);
const FrameworkDetailPage = React.lazy(
  () => import("@/modules/framework/pages/detail"),
);

export const frameworksRoutes: RouteObject[] = [
  {
    path: "frameworks",
    element: (
      <LazyLoad>
        <FrameworkListPage />
      </LazyLoad>
    ),
  },
  {
    path: "frameworks/create",
    element: (
      <LazyLoad>
        <FrameworkDetailPage />
      </LazyLoad>
    ),
  },
  {
    path: "frameworks/:id",
    element: (
      <LazyLoad>
        <FrameworkDetailPage />
      </LazyLoad>
    ),
  },
];
