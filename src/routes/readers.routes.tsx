import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const ReadersPage = React.lazy(() => import("@/modules/readers/pages"));
const ReaderDetailPage = React.lazy(() => import("@/modules/readers/pages/detail"));

export const readersRoutes: RouteObject[] = [
  {
    path: "readers",
    element: (
      <LazyLoad>
        <ReadersPage />
      </LazyLoad>
    ),
  },
  {
    path: "readers/:id",
    element: (
      <LazyLoad>
        <ReaderDetailPage />
      </LazyLoad>
    ),
  },
];
