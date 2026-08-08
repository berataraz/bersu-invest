import { SiteContentEditor, type SiteContentEditorItem } from "@/components/admin/site-content-editor";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { getSiteContent } from "@/modules/content/site-content.service";

export default async function SiteContentPage() {
  await requireDashboardPermission("content.manage");
  const keys = ["homepage", "aiAssistant", "footer"] as const;
  const items = await Promise.all(keys.map(getSiteContent));
  return <SiteContentEditor initialItems={items as SiteContentEditorItem[]} />;
}
