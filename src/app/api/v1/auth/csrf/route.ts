import { NextResponse } from "next/server";
import { issueCsrf } from "@/lib/security/csrf";

export async function GET() {
  const response = NextResponse.json({ data: { token: "" } });
  const token = issueCsrf(response);
  response.headers.set("x-csrf-token", token);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
