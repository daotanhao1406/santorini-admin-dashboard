import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./AuthProvider";
import QueryProdiver from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider storageKey="santorini-theme">
      <QueryProdiver>
        <AuthProvider>{children}</AuthProvider>
      </QueryProdiver>
      <Toaster />
    </ThemeProvider>
  );
}
