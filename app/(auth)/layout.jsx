import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/shared/auth/session-provider";
import "../globals.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }) {
  return (
    <SessionProvider>
      {children}

      <Toaster />
    </SessionProvider>
  );
}
