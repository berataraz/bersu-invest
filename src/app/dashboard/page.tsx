import Link from "next/link";
import { CalendarPlus, FilePlus2, UserPlus, UsersRound } from "lucide-react";
import { PropertyStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  await requireDashboardPermission("properties.read");
  const now = new Date();
  const [publishedProperties, draftProperties, soldProperties, rentedProperties, activeCustomers, openLeads, activeAgents, upcomingAppointments, openTasks, recentActivity] = await Promise.all([
    prisma.property.count({ where: { deletedAt: null, status: PropertyStatus.PUBLISHED } }),
    prisma.property.count({ where: { deletedAt: null, status: PropertyStatus.DRAFT } }),
    prisma.property.count({ where: { deletedAt: null, status: PropertyStatus.SOLD } }),
    prisma.property.count({ where: { deletedAt: null, status: PropertyStatus.RENTED } }),
    prisma.customer.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.lead.count({ where: { deletedAt: null, status: { in: ["NEW", "CONTACTED", "QUALIFIED", "VIEWING", "OFFER"] } } }),
    prisma.user.count({ where: { deletedAt: null, status: "ACTIVE", roles: { some: { role: { key: "AGENT" } } } } }),
    prisma.appointment.count({ where: { deletedAt: null, startsAt: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.task.count({ where: { deletedAt: null, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    prisma.auditLog.findMany({ take: 8, orderBy: { occurredAt: "desc" }, include: { actor: { select: { firstName: true, lastName: true } } } }),
  ]);
  const metrics = [["Yayındaki ilan", publishedProperties], ["Taslak ilan", draftProperties], ["Satılan", soldProperties], ["Kiralanan", rentedProperties], ["Aktif müşteri", activeCustomers], ["Açık talep", openLeads], ["Aktif danışman", activeAgents], ["Yaklaşan randevu", upcomingAppointments], ["Açık görev", openTasks]];
  const actions = [["/dashboard/properties/new", "Yeni İlan", FilePlus2], ["/dashboard/customers/new", "Yeni Müşteri", UsersRound], ["/dashboard/users?role=AGENT", "Yeni Danışman", UserPlus], ["/dashboard/appointments", "Yeni Randevu", CalendarPlus]] as const;
  return <div className="mx-auto max-w-[1280px]"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-strong">Canlı Veritabanı Özeti</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Genel Bakış</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Metrikler yalnızca mevcut kalıcı kayıtlardan hesaplanır; boş veri için örnek kayıt üretilmez.</p><div className="mt-7 flex flex-wrap gap-3">{actions.map(([href, label, Icon]) => <Link key={href} href={href} className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-4 text-sm font-bold shadow-soft hover:bg-surface-subtle"><Icon className="size-4 text-gold-strong" />{label}</Link>)}</div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value]) => <Card key={String(label)}><CardContent className="p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">{label}</p><p className="mt-3 font-display text-4xl font-semibold">{value}</p></CardContent></Card>)}</div><Card className="mt-6"><CardContent className="p-6"><h2 className="font-display text-2xl font-semibold">Son Aktivite</h2>{recentActivity.length === 0 ? <p className="mt-5 rounded-sm bg-surface-subtle p-4 text-sm text-ink-muted">Henüz aktivite kaydı yok.</p> : <ul className="mt-5 divide-y divide-line">{recentActivity.map((item) => <li key={item.id} className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><span><strong>{item.actor ? `${item.actor.firstName} ${item.actor.lastName}` : "Sistem"}</strong> · {item.entityType} / {item.action}</span><time className="text-xs text-ink-muted">{item.occurredAt.toLocaleString("tr-TR")}</time></li>)}</ul>}</CardContent></Card></div>;
}
