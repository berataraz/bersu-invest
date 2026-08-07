import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) { const session = await auth(); if (!session?.user?.id) redirect("/admin/login"); if (session.user.mustChangePassword) redirect("/admin/change-password"); return <div className="min-h-dvh bg-canvas lg:flex"><AdminSidebar /><div className="min-w-0 flex-1"><AdminTopbar /><main className="p-5 sm:p-8 lg:p-10">{children}</main></div></div>; }
