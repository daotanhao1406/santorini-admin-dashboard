import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "./layouts/ProtectedLayout";
import DashboardPage from "./pages/DashboardPage";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    // errorElement: <NotFoundPage />, // Xử lý lỗi cục bộ
    children: [
      {
        index: true, // Đường dẫn /dashboard
        element: <DashboardPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
    ],
  },
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // },
]);
