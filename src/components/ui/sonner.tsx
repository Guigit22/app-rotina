import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as "light" | "dark"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ style: { fontSize: "0.875rem" } }}
    />
  );
}

export { toast } from "sonner";
