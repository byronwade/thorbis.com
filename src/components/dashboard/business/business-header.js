"use client";

import ModularHeader from "../../shared/modular-header";

/**
 * Business Dashboard Header using the new modular system
 * Automatically detects industry and applies appropriate presets
 */
export function BusinessHeader({ 
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

export default BusinessHeader;