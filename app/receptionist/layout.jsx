import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

import { SessionProvider } from "@/components/shared/auth/session-provider";

export const metadata = {
  title: "Receptionist Page - Manage your listings, bookings e.t.c",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function VendorLayout({ children }) {
  return (
    <>
      {" "}
      <SessionProvider>{children}</SessionProvider>
      <Toaster />
    </>
  );
}
