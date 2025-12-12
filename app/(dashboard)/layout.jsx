import "../globals.css";

import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title:
    "Bookhushly Admin Page - Manage your vendors, listings, bookings e.t.c",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function VendorLayout({ children }) {
  return (
    <>
      {" "}
      <main className="min-h-screen ">{children}</main>
      <Toaster />
    </>
  );
}
