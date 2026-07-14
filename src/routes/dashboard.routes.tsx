import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

const DashboardPage = React.lazy(() => import("@/modules/dashboarch/pages"));
const StoryDetailPage = React.lazy(
  () => import("@/modules/stories/pages/detail")
);
const RegisterStoryPage = React.lazy(
  () => import("@/modules/stories/pages/register")
);
const SubmittedStoriesPage = React.lazy(
  () => import("@/modules/stories/pages/history")
);
const LoginReaderPage = React.lazy(() => import("@/modules/auth/pages/login"));
const RegisterReaderPage = React.lazy(
  () => import("@/modules/auth/pages/register")
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="dashboard" replace />,
  },
  {
    path: "dashboard",
    element: (
      <LazyLoad>
        <DashboardPage />
      </LazyLoad>
    ),
  },
  {
    path: "stories/:id",
    element: (
      <LazyLoad>
        <StoryDetailPage />
      </LazyLoad>
    ),
  },
  {
    path: "register-story",
    element: (
      <LazyLoad>
        <RegisterStoryPage />
      </LazyLoad>
    ),
  },
  {
    path: "submitted-stories",
    element: (
      <LazyLoad>
        <SubmittedStoriesPage />
      </LazyLoad>
    ),
  },
  {
    path: "auth/login",
    element: (
      <LazyLoad>
        <LoginReaderPage />
      </LazyLoad>
    ),
  },
  {
    path: "auth/register",
    element: (
      <LazyLoad>
        <RegisterReaderPage />
      </LazyLoad>
    ),
  },
];
