// app/(admin)/admin/layout.jsx
import { Toaster } from "@/components/ui/sonner";
import { AdminLayoutClient } from "./client-layout";

export const metadata = {
  title: "Admin Dashboard — BookHushly",
  description: "Manage vendors, customers, bookings and operations.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminLayoutClient>{children}</AdminLayoutClient>
      <Toaster />
    </>
  );
}
