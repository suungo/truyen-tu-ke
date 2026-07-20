import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const NotificationsPage = React.lazy(() => import("@/modules/notifications/pages"));

export const notificationsRoutes: RouteObject[] = [
  {
    path: "notifications",
    element: (
      <LazyLoad>
        <NotificationsPage />
      </LazyLoad>
    ),
  },
];
