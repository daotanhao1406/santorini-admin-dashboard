import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    // Redirect mặc định: Vào thẳng dashboard nếu đã login (logic xử lý sau),
    // tạm thời mình cho về /dashboard
    element: <Navigate to="/" replace />,
  },
  // {
  //   path: "/auth",
  //   element: <AuthLayout />,
  //   children: [
  //     {
  //       path: "login",
  //       element: <LoginPage />,
  //     },
  //   ],
  // },
  {
    // Khu vực Dashboard (Được bảo vệ)
    path: "/",
    element: <DashboardLayout />,
    // errorElement: <NotFoundPage />, // Xử lý lỗi cục bộ
    children: [
      {
        index: true, // Đường dẫn /dashboard
        element: <DashboardPage />,
      },
    ],
  },
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // },
]);
