"use client";

import ModularHeader from "../shared/modular-header";

/**
 * Academy Dashboard Header using the new modular system
 */
export default function AcademyHeader({
  customTitle,
  customSubtitle
}) {
  return (
    <ModularHeader 
      dashboardType="academy"
      showCompanySelector={false}
      showSearch={true}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    />
  );
}