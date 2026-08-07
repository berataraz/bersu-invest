import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { aiUsageAnalytics } from "@/modules/ai/ai-admin.service";

function parseDate(value: string | null, fallback: Date) { if (!value) return fallback; const parsed = new Date(value); return Number.isNaN(parsed.valueOf()) ? fallback : parsed; }
export async function GET(request: NextRequest) { try { await requirePermission("ai.analytics"); const to = parseDate(request.nextUrl.searchParams.get("to"), new Date()); const from = parseDate(request.nextUrl.searchParams.get("from"), new Date(to.valueOf() - 30 * 24 * 60 * 60 * 1_000)); if (from > to) throw new Error("Invalid date range."); return ok(await aiUsageAnalytics(from, to)); } catch (error) { return fail(error); } }
