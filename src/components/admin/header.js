"use client";

import ModularHeader from "../shared/modular-header";

/**
 * Admin Dashboard Header using the new modular system
 */
export default function AdminHeader({
  customTitle,
  customSubtitle
}) {
  return (
    <ModularHeader 
      dashboardType="admin"
      showCompanySelector={false}
      showSearch={true}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    />
  );
}