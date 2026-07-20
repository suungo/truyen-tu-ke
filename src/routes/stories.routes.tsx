import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const StoriesListPage = React.lazy(
  () => import("@/modules/stories/pages/list"),
);
const StoryFormPage = React.lazy(
  () => import("@/modules/stories/pages/form"),
);
const GenresListPage = React.lazy(
  () => import("@/modules/stories/pages/genres"),
);
const PendingStoriesListPage = React.lazy(
  () => import("@/modules/stories/pages/pending"),
);

export const storiesRoutes: RouteObject[] = [
  {
    path: "stories",
    element: (
      <LazyLoad>
        <StoriesListPage />
      </LazyLoad>
    ),
  },
  {
    path: "stories/create",
    element: (
      <LazyLoad>
        <StoryFormPage />
      </LazyLoad>
    ),
  },
  {
    path: "stories/:id/edit",
    element: (
      <LazyLoad>
        <StoryFormPage />
      </LazyLoad>
    ),
  },
  {
    path: "genres",
    element: (
      <LazyLoad>
        <GenresListPage />
      </LazyLoad>
    ),
  },
  {
    path: "stories/pending",
    element: (
      <LazyLoad>
        <PendingStoriesListPage />
      </LazyLoad>
    ),
  },
];
