import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { useLocation } from "react-router-dom";

export function PageTitle() {
  const location = useLocation();
  const pathname = location.pathname;

  // 1. Làm phẳng mảng sidebarItems để dễ tìm kiếm (bỏ qua các Group)
  const allNavItems = sidebarItems.flatMap((group) => group.items);

  // 2. Tìm item khớp với URL hiện tại
  // Logic: Tìm item mà URL hiện tại bắt đầu bằng URL của item đó
  // Cần sắp xếp giảm dần theo độ dài URL để khớp chính xác nhất (ví dụ /products/detail ưu tiên hơn /products)
  const activeItem = allNavItems
    .sort((a, b) => b.url.length - a.url.length)
    .find((item) => {
      // Trường hợp đặc biệt: Trang chủ "/" phải khớp chính xác
      if (item.url === "/") {
        return pathname === "/";
      }
      // Các trang con: pathname bắt đầu bằng item.url
      // Thêm dấu "/" để tránh trường hợp /products-new khớp với /products
      return pathname === item.url || pathname.startsWith(`${item.url}/`);
    });

  // 3. Fallback: Nếu không tìm thấy thì mặc định là Dashboard hoặc rỗng
  const title = activeItem?.title || "Dashboard";

  return <>{title}</>;
}
