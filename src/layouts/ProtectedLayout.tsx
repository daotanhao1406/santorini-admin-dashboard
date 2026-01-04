// src/components/layout/ProtectedLayout.tsx (Hoặc đường dẫn file của bạn)
import { Navigate, Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AccountSwitcher } from "@/components/layout/AppSidebar/AccountSwitcher";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/layout/AppSidebar/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { PageTitle } from "@/components/layout/PageTitle";

export default function ProtectedLayout() {
  const { session, profile, loading, signOut } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. Logic bảo vệ cấp 1: Chưa đăng nhập -> Login
  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Logic bảo vệ cấp 2: Đã login nhưng KHÔNG PHẢI OWNER
  // Trường hợp này: Customer tò mò mò vào link admin
  if (profile && profile.role !== "owner") {
    // Đăng xuất ngay lập tức để tránh loop vô hạn hoặc kẹt session
    signOut();
    return <Navigate to="/auth/login" replace />;
  }

  // Chuẩn bị dữ liệu user thật cho UI
  // Fallback nếu chưa load kịp profile (dù hiếm khi xảy ra vì loading đã chặn)
  const userData = {
    name: profile?.full_name || "Admin User",
    email: profile?.email || session.user.email || "",
    avatar: profile?.avatar_url || "", // Avatar rỗng component sẽ tự render fallback ký tự đầu
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md"
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 my-auto data-[orientation=vertical]:h-4"
              />
              <PageTitle />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Separator
                orientation="vertical"
                className="mx-2 my-auto data-[orientation=vertical]:h-4"
              />
              {/* Truyền dữ liệu thật vào đây */}
              <AccountSwitcher user={userData} />
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
