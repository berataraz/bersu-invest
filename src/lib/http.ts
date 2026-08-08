import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly code = "REQUEST_FAILED") {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  if (typeof error === "object" && error !== null && "issues" in error && Array.isArray(error.issues)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "The submitted data is invalid.", fields: error.issues.map((issue) => issue.path.join(".")) } }, { status: 400 });
  }
  console.error("Unhandled API error", error);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, { status: 500 });
}
