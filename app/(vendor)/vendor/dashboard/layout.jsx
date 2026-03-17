// app/(vendor)/vendor/layout.jsx

import { Toaster } from "@/components/ui/sonner";
import { VendorLayoutClient } from "./client-layout";

export const metadata = {
  robots: { index: false, follow: false },
};

export const metadata = {
  title: "Vendor Dashboard — BookHushly",
  description: "Manage your listings, bookings, and revenue on BookHushly.",
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
