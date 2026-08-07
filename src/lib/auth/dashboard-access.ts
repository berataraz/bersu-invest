import { redirect } from "next/navigation";
import { ApiError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";

// Route segments render concurrently with layouts, so each protected page must
// convert authentication failures into a navigation rather than an RSC error.
export async function requireDashboardPermission(permission: string) {
  try {
    return await requirePermission(permission);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login");
    if (error instanceof ApiError && error.status === 403) redirect("/");
    throw error;
  }
}
