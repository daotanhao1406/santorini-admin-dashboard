import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  // State quản lý form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State quản lý trạng thái UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Đăng nhập với Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !user)
        throw authError || new Error("Đăng nhập thất bại");

      // 2. KIỂM TRA ROLE NGAY LẬP TỨC
      // Query trực tiếp bảng profiles để check nóng
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // 3. Nếu không phải Owner -> Đuổi ngay
      if (profile?.role !== "owner") {
        await supabase.auth.signOut(); // Đăng xuất session vừa tạo
        throw new Error(
          "Tài khoản của bạn không có quyền truy cập Admin Dashboard!"
        );
      }

      // 4. Nếu là Owner -> Chuyển hướng vào Dashboard
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập email và mật khẩu quản trị viên của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <FieldGroup>
                {/* Hiển thị lỗi nếu có */}
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-red-600 bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@santorini.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </Field>

                <Field className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Quên mật khẩu? Vui lòng liên hệ bộ phận kỹ thuật.
        </div>
      </div>
    </div>
  );
}
