import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider storageKey="santorini-theme">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
