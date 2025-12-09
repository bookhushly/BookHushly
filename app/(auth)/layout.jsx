import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/auth/session-provider";
import "../globals.css";

export default function AuthLayout({ children }) {
  return (
    <SessionProvider>
      {children}

      <Toaster />
    </SessionProvider>
  );
}
