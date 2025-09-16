'use client'

import { 
  BusinessHero,
  TrustIndicators,
  ServiceGrid,
  ProjectGallery,
  FloatingContactBar,
  ContactSection,
  BusinessSidebar
} from '.'

interface BusinessProfileProps {
  business: any
}

export default function BusinessProfile({ business }: BusinessProfileProps) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Business Hero Section */}
      <BusinessHero business={business} />
      
      {/* Trust Indicators Section */}
      <TrustIndicators business={business} />
      
      {/* Services Grid Section */}
      <ServiceGrid business={business} />
      
      {/* Project Gallery Section */}
      <ProjectGallery business={business} />

      {/* Two-Column Layout with Content and Sidebar */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Contact Section */}
            <ContactSection business={business} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BusinessSidebar business={business} />
          </div>
        </div>
      </div>

      {/* Floating Contact Bar */}
      <FloatingContactBar business={business} />
    </div>
  )
}