import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9" // Bo tròn nhìn cho mềm mại
      title="Đổi giao diện Sáng/Tối"
    >
      {/* Icon Mặt trời: Hiển thị khi Light, ẩn khi Dark */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

      {/* Icon Mặt trăng: Ẩn khi Light, hiển thị khi Dark */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

      <span className="sr-only">Đổi giao diện</span>
    </Button>
  );
}
