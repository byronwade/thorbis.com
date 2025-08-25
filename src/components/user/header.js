"use client";

import ModularHeader from "../shared/modular-header";

/**
 * User Dashboard Header using the new modular system
 */
export default function Header({
  customTitle,
  customSubtitle
}) {
  return (
    <ModularHeader 
      dashboardType="user"
      showCompanySelector={false}
      showSearch={false}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    />
  );
}