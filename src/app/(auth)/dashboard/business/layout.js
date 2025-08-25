import { isEnabled } from "@/lib/flags/server";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";
import RouteGuard from "@components/shared/RouteGuard";

export default async function BusinessLayout({ children }) {
  const on = await isEnabled("dashboardCore");
  return (
    <UnifiedDashboardLayout dashboardType="business" flags={{ dashboardCore: on }}>
      <RouteGuard>
        {children}
      </RouteGuard>
    </UnifiedDashboardLayout>
  );
}
