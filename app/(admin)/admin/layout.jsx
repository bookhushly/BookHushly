import "../../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AdminLayoutClient } from "./client-layout";

export const metadata = {
  title: "Bookhushly Admin Page - Manage your listings, bookings e.t.c",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function AdminLayout({ children }) {
  return (
    <>
      {" "}
      <AdminLayoutClient>{children}</AdminLayoutClient>
      <Toaster />
    </>
  );
}
