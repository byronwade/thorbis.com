import { isEnabled } from "@/lib/flags/server";
import UnifiedDashboardLayout from "@components/shared/layouts/UnifiedDashboardLayout";

export default async function DevelopersLayout({ children }) {
  const on = await isEnabled("dashboardCore");
  if (!on) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold">Developers Dashboard is not available</h1>
        <p className="text-muted-foreground mt-2">Please check back soon.</p>
      </div>
    );
  }

  return (
    <UnifiedDashboardLayout dashboardType="developers">
      {children}
    </UnifiedDashboardLayout>
  );
}
