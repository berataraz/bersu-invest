import { prisma } from "@/lib/prisma";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { CustomerEditor } from "@/components/admin/customer-editor";
export default async function NewCustomerPage() { await requireDashboardPermission("crm.manage"); const agents = await prisma.user.findMany({ where: { status: "ACTIVE", deletedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }); return <CustomerEditor agents={agents} />; }
