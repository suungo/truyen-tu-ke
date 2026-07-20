import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const VideoGeneratorPage = React.lazy(
  () => import("@/modules/video-generator/pages")
);

export const videoGeneratorRoutes: RouteObject[] = [
  {
    path: "video-generator",
    element: (
      <LazyLoad>
        <VideoGeneratorPage />
      </LazyLoad>
    ),
  },
];
