"use client";

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const AdminDashboardContent = nextDynamic(
  () => import("./_dashboard-content"),
  { ssr: false },
);

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
