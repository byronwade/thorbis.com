"use client";

import ModularHeader from "../shared/modular-header";

/**
 * LocalHub Dashboard Header using the new modular system
 */
export default function LocalHubHeader({
  customTitle,
  customSubtitle
}) {
  return (
    <ModularHeader 
      dashboardType="localhub"
      showCompanySelector={false}
      showSearch={true}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    />
  );
}