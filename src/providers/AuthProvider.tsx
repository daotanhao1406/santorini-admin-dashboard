import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  role: "owner" | "customer";
  full_name: string;
  avatar_url?: string;
  email?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper fetch profile (Giữ nguyên logic cũ)
  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Nếu lỗi không tìm thấy (PGRST116), có thể trả về null hoặc object mặc định
        if (error.code === "PGRST116") return null;
        console.error("Error fetching profile:", error);
        return null;
      }
      return { ...data, email } as Profile;
    } catch (error) {
      console.error("Unexpected error:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true; // Cờ kiểm tra component còn mount hay không

    // Hàm khởi tạo riêng biệt, chạy 1 lần duy nhất khi mount
    const initializeAuth = async () => {
      try {
        // 1. Lấy session từ Local Storage (Nhanh)
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          // 2. Nếu có User -> Gọi API lấy Profile ngay lập tức
          if (initialSession?.user) {
            const profileData = await fetchProfile(
              initialSession.user.id,
              initialSession.user.email
            );
            if (mounted) setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        // 3. QUAN TRỌNG: Luôn tắt loading dù có lỗi hay không
        if (mounted) setLoading(false);
      }
    };

    // Chạy hàm khởi tạo
    initializeAuth();

    // 4. Lắng nghe sự kiện thay đổi (Login, Logout, Token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Chỉ xử lý logic update nếu component đã mount và loading ban đầu đã xong
      // Hoặc xử lý các sự kiện SIGN_IN / SIGN_OUT cụ thể

      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setProfile(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch lại profile nếu user thay đổi hoặc chưa có profile
        if (currentSession?.user) {
          // Logic check user cũ user mới để tránh fetch thừa
          setUser((prevUser) => {
            if (prevUser?.id !== currentSession.user.id) {
              fetchProfile(
                currentSession.user.id,
                currentSession.user.email
              ).then((data) => setProfile(data));
            }
            return currentSession.user;
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // UI sẽ tự update nhờ listener onAuthStateChange ('SIGNED_OUT')
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
