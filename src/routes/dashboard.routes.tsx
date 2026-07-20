import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { storiesRoutes } from "./stories.routes";
import { frameworksRoutes } from "./frameworks.routes";
import { readersRoutes } from "./readers.routes";
import { notificationsRoutes } from "./notifications.routes";

const DashboardPage = React.lazy(() => import("@/modules/dashboarch/pages"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="dashboard" />,
  },
  {
    path: "dashboard",
    element: (
      <LazyLoad>
        <DashboardPage />
      </LazyLoad>
    ),
  },
  ...storiesRoutes,
  ...frameworksRoutes,
  ...readersRoutes,
  ...notificationsRoutes,
];
