import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { crmStatistics } from "@/modules/crm/crm.service";
export async function GET(request: NextRequest) { try { const user = await requirePermission("crm.read"); return ok(await crmStatistics(request.nextUrl.searchParams.get("mine") === "true" ? user.id : undefined)); } catch (error) { return fail(error); } }
