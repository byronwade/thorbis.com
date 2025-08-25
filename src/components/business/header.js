"use client";

import ModularHeader from "../shared/modular-header";

/**
 * Business Header using the new modular system
 */
export default function BusinessHeader({
  industryOverride,
  customTitle,
  customSubtitle
}) {
  return (
    <ModularHeader 
      dashboardType="business"
      industryOverride={industryOverride}
      showCompanySelector={true}
      showSearch={true}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    />
  );
}