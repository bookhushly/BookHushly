import { NextResponse } from "next/server";
import {
  getSupportStaff,
  createSupportStaff,
  resetSupportStaffPassword,
  updateSupportStaffName,
  deleteSupportStaff,
} from "@/lib/supportstaff";
import { createClient } from "@/lib/supabase/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

/** GET /api/admin/support-staff — list all support staff */
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const staff = await getSupportStaff();
    return NextResponse.json({ staff }, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("GET support-staff error:", err);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

/** POST /api/admin/support-staff — create a new support staff member */
export async function POST(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name } = await request.json();
    if (!email?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    const result = await createSupportStaff(email, name);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    console.error("POST support-staff error:", err);
    const message = err.message?.includes("already registered")
      ? "A user with this email already exists"
      : err.message || "Failed to create staff member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/admin/support-staff — reset password or update name */
export async function PATCH(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, action, name } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    if (action === "reset_password") {
      const result = await resetSupportStaffPassword(userId);
      return NextResponse.json({ success: true, password: result.password });
    }

    if (action === "update_name") {
      if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
      await updateSupportStaffName(userId, name);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("PATCH support-staff error:", err);
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}

/** DELETE /api/admin/support-staff — remove a support staff member */
export async function DELETE(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    await deleteSupportStaff(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE support-staff error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete staff member" }, { status: 500 });
  }
}
