import DefaultLayout from "@/layouts/DefaultLayout";
import { createBrowserRouter } from "react-router-dom";

import LazyLoad from "@/common/components/base/lazyLoad";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";

const routers = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazyLoad>
        <DefaultLayout />
      </LazyLoad>
    ),
    children: [...dashboardRoutes],
  },
  ...authRoutes,
]);

export default routers;
