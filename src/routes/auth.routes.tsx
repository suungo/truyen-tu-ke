import LazyLoad from "@/common/components/base/lazyLoad";
import React from "react";
import type { RouteObject } from "react-router-dom";

const LoginPage = React.lazy(() => import("@/modules/auth/login/pages"));
const RegisterPage = React.lazy(() => import("@/modules/auth/register/pages"));
const ResetPasswordPage = React.lazy(
  () => import("@/modules/auth/resetPassword/pages"),
);
const PolicyPage = React.lazy(() => import("@/modules/auth/policy"));

export const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <LazyLoad>
        <LoginPage />
      </LazyLoad>
    ),
  },
  {
    path: "/register",
    element: (
      <LazyLoad>
        <RegisterPage />
      </LazyLoad>
    ),
  },
  {
    path: "/reset",
    element: (
      <LazyLoad>
        <ResetPasswordPage />
      </LazyLoad>
    ),
  },
  {
    path: "/policy",
    element: (
      <LazyLoad>
        <PolicyPage />
      </LazyLoad>
    ),
  },
];
