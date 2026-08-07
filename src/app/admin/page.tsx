import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  if (session.user.mustChangePassword) redirect("/admin/change-password");
  redirect("/dashboard");
}
