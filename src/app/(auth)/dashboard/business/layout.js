import { isEnabled } from "@/lib/flags/server";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";

export default async function BusinessLayout({ children }) {
  const on = await isEnabled("dashboardCore");
  return <UnifiedDashboardLayout dashboardType="business" flags={{ dashboardCore: on }}>{children}</UnifiedDashboardLayout>;
}
