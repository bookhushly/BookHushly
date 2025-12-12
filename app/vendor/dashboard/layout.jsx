import "../../globals.css";

import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { VendorLayoutClient } from "./client-layout";

export const metadata = {
  title: "Bookhushly Vendor Page - Manage your listings, bookings e.t.c",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function VendorLayout({ children }) {
  return (
    <>
      {" "}
      <VendorLayoutClient>{children}</VendorLayoutClient>
      <Toaster />
    </>
  );
}
