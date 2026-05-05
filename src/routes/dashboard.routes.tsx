import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

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
];
