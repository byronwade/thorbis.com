# Thorbis RAG Data Sources

Comprehensive data source definitions for RAG ingestion covering business information, operational procedures, pricing data, and knowledge repositories.

## 📊 Data Source Taxonomy

### Primary Data Sources
```yaml
business_core:
  - business_profiles     # Company information and capabilities
  - services_catalog      # Service offerings and specifications
  - pricing_data         # Pricebooks, rate cards, cost structures
  
operational_knowledge:
  - standard_procedures   # SOPs and operational guidelines
  - troubleshooting      # Issue libraries and resolution guides
  - faqs                 # Frequently asked questions
  
customer_intelligence:
  - customer_profiles    # Customer preferences and history
  - project_histories    # Past jobs and outcomes
  - feedback_data        # Reviews, ratings, and testimonials

regulatory_compliance:
  - policy_documents     # Company policies and procedures
  - compliance_guides    # Regulatory requirements and standards
  - safety_protocols     # Safety procedures and guidelines
```

### Source Priority & Update Frequency
```typescript
interface DataSourceConfig {
  source_id: string
  source_name: string
  source_type: SourceType
  priority: 'critical' | 'high' | 'medium' | 'low'
  update_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  tenant_scoped: boolean
  requires_processing: boolean
  retention_days: number
}

enum SourceType {
  BUSINESS_PROFILE = 'business_profile',
  SERVICES_CATALOG = 'services_catalog', 
  PRICEBOOK = 'pricebook',
  SOP = 'standard_operating_procedure',
  FAQ = 'frequently_asked_questions',
  ISSUE_LIBRARY = 'issue_library',
  CUSTOMER_DATA = 'customer_data',
  PROJECT_HISTORY = 'project_history',
  POLICY_DOCUMENT = 'policy_document',
  TRAINING_MATERIAL = 'training_material'
}

const DATA_SOURCES: DataSourceConfig[] = [
  // Business Core Data
  {
    source_id: 'business_profiles',
    source_name: 'Business Profiles',
    source_type: SourceType.BUSINESS_PROFILE,
    priority: 'critical',
    update_frequency: 'daily',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 2555 // 7 years
  },
  
  {
    source_id: 'services_catalog',
    source_name: 'Services Catalog',
    source_type: SourceType.SERVICES_CATALOG,
    priority: 'critical',
    update_frequency: 'daily',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 1095 // 3 years
  },
  
  {
    source_id: 'pricebooks',
    source_name: 'Pricing Data',
    source_type: SourceType.PRICEBOOK,
    priority: 'critical',
    update_frequency: 'hourly',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 2555 // 7 years
  },
  
  // Operational Knowledge
  {
    source_id: 'sops',
    source_name: 'Standard Operating Procedures',
    source_type: SourceType.SOP,
    priority: 'high',
    update_frequency: 'weekly',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 1825 // 5 years
  },
  
  {
    source_id: 'faqs',
    source_name: 'Frequently Asked Questions',
    source_type: SourceType.FAQ,
    priority: 'high',
    update_frequency: 'daily',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 1095 // 3 years
  },
  
  {
    source_id: 'issue_libraries',
    source_name: 'Issue Resolution Libraries',
    source_type: SourceType.ISSUE_LIBRARY,
    priority: 'high',
    update_frequency: 'real_time',
    tenant_scoped: true,
    requires_processing: true,
    retention_days: 1825 // 5 years
  }
]
```

## 🏢 Business Profiles

### Business Information Schema
```typescript
interface BusinessProfile {
  business_id: string
  tenant_id: string
  
  // Core Information
  business_name: string
  business_type: 'field_services' | 'restaurant' | 'retail' | 'professional_services'
  industry_codes: string[]           // NAICS codes
  business_description: string
  
  // Capabilities
  services_offered: ServiceOffering[]
  specializations: string[]
  certifications: Certification[]
  licenses: License[]
  
  // Geographic Coverage
  service_areas: ServiceArea[]
  territories: Territory[]
  
  // Operational Details
  hours_of_operation: OperatingHours[]
  seasonal_availability: SeasonalSchedule[]
  capacity_limits: CapacityInfo
  
  // Contact & Location
  locations: BusinessLocation[]
  contact_methods: ContactMethod[]
  
  // Metadata
  created_at: Date
  updated_at: Date
  last_verified: Date
  data_quality_score: number
}

interface ServiceOffering {
  service_id: string
  service_name: string
  service_category: string
  description: string
  typical_duration: number          // minutes
  requires_equipment: string[]
  skill_requirements: string[]
  pricing_model: 'fixed' | 'hourly' | 'materials_plus_labor' | 'custom'
  base_price?: number
  price_modifiers: PriceModifier[]
}

class BusinessProfileProcessor {
  async processBusinessProfile(profile: BusinessProfile): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Main business profile document
    documents.push({
      document_id: `business_profile_${profile.business_id}`,
      source_type: 'business_profile',
      tenant_id: profile.tenant_id,
      title: `${profile.business_name} - Business Profile`,
      content: await this.generateBusinessProfileContent(profile),
      entities: await this.extractBusinessEntities(profile),
      metadata: {
        business_id: profile.business_id,
        business_type: profile.business_type,
        last_updated: profile.updated_at,
        data_quality: profile.data_quality_score
      },
      as_of: new Date()
    })
    
    // Individual service documents
    for (const service of profile.services_offered) {
      documents.push({
        document_id: `service_${service.service_id}`,
        source_type: 'services_catalog',
        tenant_id: profile.tenant_id,
        title: `${service.service_name} Service`,
        content: await this.generateServiceContent(service, profile),
        entities: await this.extractServiceEntities(service, profile),
        metadata: {
          business_id: profile.business_id,
          service_id: service.service_id,
          service_category: service.service_category,
          pricing_model: service.pricing_model
        },
        as_of: new Date()
      })
    }
    
    return documents
  }
  
  private async generateBusinessProfileContent(profile: BusinessProfile): Promise<string> {
    return `
Business: ${profile.business_name}
Type: ${profile.business_type}
Description: ${profile.business_description}

Services Offered:
${profile.services_offered.map(service => 
  `- ${service.service_name}: ${service.description}`
).join('\n')}

Specializations: ${profile.specializations.join(', ')}

Service Areas: ${profile.service_areas.map(area => area.name).join(', ')}

Operating Hours:
${profile.hours_of_operation.map(hours => 
  `${hours.day}: ${hours.open_time} - ${hours.close_time}`
).join('\n')}

Certifications: ${profile.certifications.map(cert => cert.name).join(', ')}
    `.trim()
  }
}
```

## 🛠️ Services Catalog

### Service Definition Framework
```typescript
interface ServiceCatalog {
  catalog_id: string
  tenant_id: string
  catalog_name: string
  version: string
  
  services: Service[]
  service_categories: ServiceCategory[]
  
  created_at: Date
  updated_at: Date
  published_at?: Date
  status: 'draft' | 'published' | 'archived'
}

interface Service {
  service_id: string
  service_code: string
  service_name: string
  service_category_id: string
  
  // Service Description
  short_description: string
  detailed_description: string
  service_steps: ServiceStep[]
  
  // Requirements & Prerequisites
  skill_requirements: SkillRequirement[]
  equipment_required: Equipment[]
  material_requirements: Material[]
  safety_requirements: string[]
  
  // Timing & Scheduling
  estimated_duration: {
    min_minutes: number
    max_minutes: number
    typical_minutes: number
  }
  
  scheduling_constraints: SchedulingConstraint[]
  
  // Pricing Information
  pricing_structure: PricingStructure
  cost_components: CostComponent[]
  
  // Quality & Outcomes
  success_criteria: string[]
  quality_standards: QualityStandard[]
  warranty_terms?: WarrantyTerms
  
  // Documentation
  related_sops: string[]           // References to SOPs
  training_materials: string[]     // References to training docs
  troubleshooting_guides: string[] // References to issue libraries
}

interface ServiceStep {
  step_number: number
  step_name: string
  description: string
  estimated_duration: number
  required_skills: string[]
  required_equipment: string[]
  safety_notes: string[]
  quality_checkpoints: string[]
}

class ServicesCatalogProcessor {
  async processServicesCatalog(catalog: ServiceCatalog): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Main catalog overview
    documents.push({
      document_id: `catalog_${catalog.catalog_id}`,
      source_type: 'services_catalog',
      tenant_id: catalog.tenant_id,
      title: `${catalog.catalog_name} - Services Overview`,
      content: await this.generateCatalogOverview(catalog),
      entities: await this.extractCatalogEntities(catalog),
      metadata: {
        catalog_id: catalog.catalog_id,
        version: catalog.version,
        service_count: catalog.services.length
      },
      as_of: catalog.updated_at
    })
    
    // Individual service documents
    for (const service of catalog.services) {
      documents.push({
        document_id: `service_detail_${service.service_id}`,
        source_type: 'services_catalog',
        tenant_id: catalog.tenant_id,
        title: `${service.service_name} - Detailed Service Guide`,
        content: await this.generateDetailedServiceContent(service, catalog),
        entities: await this.extractServiceDetailEntities(service),
        metadata: {
          service_id: service.service_id,
          service_code: service.service_code,
          category_id: service.service_category_id,
          duration_estimate: service.estimated_duration.typical_minutes
        },
        as_of: catalog.updated_at
      })
    }
    
    return documents
  }
  
  private async generateDetailedServiceContent(service: Service, catalog: ServiceCatalog): Promise<string> {
    return `
Service: ${service.service_name} (${service.service_code})
Category: ${this.getCategoryName(service.service_category_id, catalog)}

Description:
${service.detailed_description}

Service Steps:
${service.service_steps.map((step, index) => `
${index + 1}. ${step.step_name}
   Duration: ${step.estimated_duration} minutes
   Description: ${step.description}
   Required Skills: ${step.required_skills.join(', ')}
   Equipment Needed: ${step.required_equipment.join(', ')}
   ${step.safety_notes.length > 0 ? `Safety Notes: ${step.safety_notes.join('; ')}` : ''}
`).join('\n')}

Requirements:
- Skills: ${service.skill_requirements.map(req => req.skill_name).join(', ')}
- Equipment: ${service.equipment_required.map(eq => eq.name).join(', ')}
- Materials: ${service.material_requirements.map(mat => mat.name).join(', ')}

Estimated Duration: ${service.estimated_duration.typical_minutes} minutes
(Range: ${service.estimated_duration.min_minutes} - ${service.estimated_duration.max_minutes} minutes)

Pricing: ${this.formatPricingStructure(service.pricing_structure)}

Quality Standards:
${service.quality_standards.map(std => `- ${std.standard_name}: ${std.description}`).join('\n')}

Success Criteria:
${service.success_criteria.map(criteria => `- ${criteria}`).join('\n')}

Related Documentation:
- SOPs: ${service.related_sops.join(', ')}
- Training Materials: ${service.training_materials.join(', ')}
- Troubleshooting: ${service.troubleshooting_guides.join(', ')}
    `.trim()
  }
}
```

## 💰 Pricebooks

### Pricing Data Structure
```typescript
interface Pricebook {
  pricebook_id: string
  tenant_id: string
  pricebook_name: string
  version: string
  
  // Effective Period
  effective_from: Date
  effective_until?: Date
  
  // Pricing Entries
  service_prices: ServicePrice[]
  material_prices: MaterialPrice[]
  labor_rates: LaborRate[]
  
  // Pricing Rules
  markup_rules: MarkupRule[]
  discount_rules: DiscountRule[]
  seasonal_adjustments: SeasonalAdjustment[]
  
  // Geographic Variations
  territory_adjustments: TerritoryAdjustment[]
  
  // Metadata
  created_by: string
  approved_by?: string
  approval_date?: Date
  status: 'draft' | 'approved' | 'active' | 'archived'
}

interface ServicePrice {
  service_id: string
  service_name: string
  
  // Base Pricing
  base_price: number
  price_unit: 'fixed' | 'per_hour' | 'per_square_foot' | 'per_unit'
  
  // Variable Components
  labor_component: number
  material_component?: number
  equipment_component?: number
  
  // Modifiers
  complexity_multipliers: ComplexityModifier[]
  time_of_day_adjustments: TimeAdjustment[]
  urgency_premiums: UrgencyPremium[]
  
  // Minimums and Maximums
  minimum_charge?: number
  maximum_charge?: number
  
  // Validity
  valid_from: Date
  valid_until?: Date
}

class PricebookProcessor {
  async processPricebook(pricebook: Pricebook): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Main pricebook overview
    documents.push({
      document_id: `pricebook_${pricebook.pricebook_id}`,
      source_type: 'pricebook',
      tenant_id: pricebook.tenant_id,
      title: `${pricebook.pricebook_name} - Pricing Guide`,
      content: await this.generatePricebookOverview(pricebook),
      entities: await this.extractPricingEntities(pricebook),
      metadata: {
        pricebook_id: pricebook.pricebook_id,
        version: pricebook.version,
        effective_from: pricebook.effective_from,
        service_count: pricebook.service_prices.length
      },
      as_of: pricebook.effective_from
    })
    
    // Individual service pricing documents
    for (const servicePrice of pricebook.service_prices) {
      documents.push({
        document_id: `price_${servicePrice.service_id}_${pricebook.pricebook_id}`,
        source_type: 'pricebook',
        tenant_id: pricebook.tenant_id,
        title: `${servicePrice.service_name} - Pricing Details`,
        content: await this.generateServicePricingContent(servicePrice, pricebook),
        entities: await this.extractServicePricingEntities(servicePrice),
        metadata: {
          service_id: servicePrice.service_id,
          base_price: servicePrice.base_price,
          price_unit: servicePrice.price_unit,
          pricebook_id: pricebook.pricebook_id
        },
        as_of: pricebook.effective_from
      })
    }
    
    return documents
  }
  
  private async generateServicePricingContent(servicePrice: ServicePrice, pricebook: Pricebook): Promise<string> {
    return `
Service: ${servicePrice.service_name}
Base Price: $${servicePrice.base_price} ${servicePrice.price_unit}

Price Breakdown:
- Labor Component: $${servicePrice.labor_component}
${servicePrice.material_component ? `- Material Component: $${servicePrice.material_component}` : ''}
${servicePrice.equipment_component ? `- Equipment Component: $${servicePrice.equipment_component}` : ''}

${servicePrice.minimum_charge ? `Minimum Charge: $${servicePrice.minimum_charge}` : ''}
${servicePrice.maximum_charge ? `Maximum Charge: $${servicePrice.maximum_charge}` : ''}

Complexity Adjustments:
${servicePrice.complexity_multipliers.map(mod => 
  `- ${mod.complexity_level}: ${mod.multiplier}x (${mod.description})`
).join('\n')}

Time-Based Adjustments:
${servicePrice.time_of_day_adjustments.map(adj => 
  `- ${adj.time_period}: ${adj.adjustment_type === 'percentage' ? adj.adjustment_value + '%' : '$' + adj.adjustment_value} ${adj.description}`
).join('\n')}

Urgency Premiums:
${servicePrice.urgency_premiums.map(prem => 
  `- ${prem.urgency_level}: ${prem.premium_type === 'percentage' ? prem.premium_value + '%' : '$' + prem.premium_value}`
).join('\n')}

Effective Period: ${servicePrice.valid_from.toDateString()}${servicePrice.valid_until ? ` to ${servicePrice.valid_until.toDateString()}` : ' (ongoing)'}

Territory Adjustments: ${pricebook.territory_adjustments.length > 0 ? 'See territory-specific pricing' : 'None'}
Seasonal Adjustments: ${pricebook.seasonal_adjustments.length > 0 ? 'See seasonal pricing variations' : 'None'}
    `.trim()
  }
}
```

## 📋 Standard Operating Procedures (SOPs)

### SOP Document Structure
```typescript
interface StandardOperatingProcedure {
  sop_id: string
  tenant_id: string
  sop_number: string
  title: string
  version: string
  
  // Content Structure
  purpose: string
  scope: string
  responsibilities: Responsibility[]
  procedures: ProcedureStep[]
  
  // Safety & Compliance
  safety_requirements: SafetyRequirement[]
  compliance_standards: ComplianceStandard[]
  required_certifications: string[]
  
  // Quality Control
  quality_checkpoints: QualityCheckpoint[]
  inspection_requirements: InspectionRequirement[]
  
  // Documentation
  related_forms: string[]
  reference_documents: string[]
  training_requirements: string[]
  
  // Change Management
  revision_history: RevisionRecord[]
  approval_workflow: ApprovalStep[]
  
  // Lifecycle
  created_date: Date
  last_reviewed: Date
  next_review_date: Date
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'archived'
}

interface ProcedureStep {
  step_number: string
  step_title: string
  description: string
  sub_steps?: SubStep[]
  
  // Execution Details
  estimated_time: number
  required_roles: string[]
  required_tools: string[]
  required_materials: string[]
  
  // Decision Points
  decision_points: DecisionPoint[]
  
  // Safety & Quality
  safety_notes: string[]
  quality_checks: string[]
  common_mistakes: string[]
  
  // References
  related_procedures: string[]
  supporting_documents: string[]
}

class SOPProcessor {
  async processStandardOperatingProcedure(sop: StandardOperatingProcedure): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Main SOP document
    documents.push({
      document_id: `sop_${sop.sop_id}`,
      source_type: 'standard_operating_procedure',
      tenant_id: sop.tenant_id,
      title: `SOP ${sop.sop_number}: ${sop.title}`,
      content: await this.generateSOPContent(sop),
      entities: await this.extractSOPEntities(sop),
      metadata: {
        sop_id: sop.sop_id,
        sop_number: sop.sop_number,
        version: sop.version,
        status: sop.status,
        last_reviewed: sop.last_reviewed
      },
      as_of: sop.last_reviewed
    })
    
    // Individual procedure step documents for complex SOPs
    if (sop.procedures.length > 5) {
      for (const procedure of sop.procedures) {
        documents.push({
          document_id: `sop_step_${sop.sop_id}_${procedure.step_number}`,
          source_type: 'standard_operating_procedure',
          tenant_id: sop.tenant_id,
          title: `${sop.title} - Step ${procedure.step_number}: ${procedure.step_title}`,
          content: await this.generateProcedureStepContent(procedure, sop),
          entities: await this.extractProcedureEntities(procedure),
          metadata: {
            sop_id: sop.sop_id,
            step_number: procedure.step_number,
            estimated_time: procedure.estimated_time
          },
          as_of: sop.last_reviewed
        })
      }
    }
    
    return documents
  }
  
  private async generateSOPContent(sop: StandardOperatingProcedure): Promise<string> {
    return `
SOP ${sop.sop_number}: ${sop.title}
Version: ${sop.version}
Status: ${sop.status}

PURPOSE:
${sop.purpose}

SCOPE:
${sop.scope}

RESPONSIBILITIES:
${sop.responsibilities.map(resp => 
  `- ${resp.role}: ${resp.description}`
).join('\n')}

SAFETY REQUIREMENTS:
${sop.safety_requirements.map(req => 
  `- ${req.requirement_type}: ${req.description}`
).join('\n')}

PROCEDURES:
${sop.procedures.map(proc => `
${proc.step_number}. ${proc.step_title}
   Time: ${proc.estimated_time} minutes
   Roles: ${proc.required_roles.join(', ')}
   Tools: ${proc.required_tools.join(', ')}
   
   ${proc.description}
   
   ${proc.safety_notes.length > 0 ? `Safety Notes: ${proc.safety_notes.join('; ')}` : ''}
   ${proc.quality_checks.length > 0 ? `Quality Checks: ${proc.quality_checks.join('; ')}` : ''}
   ${proc.common_mistakes.length > 0 ? `Common Mistakes to Avoid: ${proc.common_mistakes.join('; ')}` : ''}
`).join('\n')}

QUALITY CHECKPOINTS:
${sop.quality_checkpoints.map(qc => 
  `- ${qc.checkpoint_name}: ${qc.description} (${qc.frequency})`
).join('\n')}

COMPLIANCE STANDARDS:
${sop.compliance_standards.map(std => 
  `- ${std.standard_name}: ${std.description}`
).join('\n')}

RELATED DOCUMENTS:
- Forms: ${sop.related_forms.join(', ')}
- References: ${sop.reference_documents.join(', ')}
- Training: ${sop.training_requirements.join(', ')}

Last Reviewed: ${sop.last_reviewed.toDateString()}
Next Review: ${sop.next_review_date.toDateString()}
    `.trim()
  }
}
```

## ❓ Frequently Asked Questions

### FAQ Management System
```typescript
interface FAQCollection {
  collection_id: string
  tenant_id: string
  collection_name: string
  category: string
  
  faqs: FAQ[]
  
  // Organization
  tags: string[]
  target_audience: 'customers' | 'staff' | 'technicians' | 'managers' | 'all'
  
  // Maintenance
  created_date: Date
  last_updated: Date
  reviewed_by: string
  next_review_date: Date
}

interface FAQ {
  faq_id: string
  question: string
  answer: string
  
  // Metadata
  category: string
  tags: string[]
  difficulty_level: 'basic' | 'intermediate' | 'advanced'
  target_audience: string[]
  
  // Usage Statistics
  view_count: number
  helpful_votes: number
  unhelpful_votes: number
  
  // Related Information
  related_faqs: string[]
  related_sops: string[]
  related_services: string[]
  
  // Lifecycle
  created_date: Date
  last_updated: Date
  created_by: string
  status: 'active' | 'under_review' | 'archived'
}

class FAQProcessor {
  async processFAQCollection(collection: FAQCollection): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Collection overview document
    documents.push({
      document_id: `faq_collection_${collection.collection_id}`,
      source_type: 'frequently_asked_questions',
      tenant_id: collection.tenant_id,
      title: `${collection.collection_name} - FAQ Collection`,
      content: await this.generateFAQCollectionContent(collection),
      entities: await this.extractFAQCollectionEntities(collection),
      metadata: {
        collection_id: collection.collection_id,
        category: collection.category,
        faq_count: collection.faqs.length,
        target_audience: collection.target_audience
      },
      as_of: collection.last_updated
    })
    
    // Individual FAQ documents
    for (const faq of collection.faqs) {
      documents.push({
        document_id: `faq_${faq.faq_id}`,
        source_type: 'frequently_asked_questions',
        tenant_id: collection.tenant_id,
        title: `FAQ: ${faq.question}`,
        content: await this.generateFAQContent(faq, collection),
        entities: await this.extractFAQEntities(faq),
        metadata: {
          faq_id: faq.faq_id,
          category: faq.category,
          difficulty: faq.difficulty_level,
          helpful_score: faq.helpful_votes - faq.unhelpful_votes
        },
        as_of: faq.last_updated
      })
    }
    
    return documents
  }
  
  private async generateFAQContent(faq: FAQ, collection: FAQCollection): Promise<string> {
    return `
Question: ${faq.question}

Answer: ${faq.answer}

Category: ${faq.category}
Difficulty Level: ${faq.difficulty_level}
Target Audience: ${faq.target_audience.join(', ')}
Tags: ${faq.tags.join(', ')}

${faq.related_faqs.length > 0 ? `Related FAQs: ${faq.related_faqs.join(', ')}` : ''}
${faq.related_sops.length > 0 ? `Related SOPs: ${faq.related_sops.join(', ')}` : ''}
${faq.related_services.length > 0 ? `Related Services: ${faq.related_services.join(', ')}` : ''}

Helpfulness: ${faq.helpful_votes} helpful, ${faq.unhelpful_votes} not helpful
Views: ${faq.view_count}

Last Updated: ${faq.last_updated.toDateString()}
    `.trim()
  }
}
```

## 🔧 Issue Libraries

### Issue Resolution Framework
```typescript
interface IssueLibrary {
  library_id: string
  tenant_id: string
  library_name: string
  
  issues: Issue[]
  categories: IssueCategory[]
  
  // Organization
  priority_levels: string[]
  complexity_levels: string[]
  
  created_date: Date
  last_updated: Date
}

interface Issue {
  issue_id: string
  issue_title: string
  issue_description: string
  
  // Classification
  category: string
  subcategory?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'rare' | 'occasional' | 'common' | 'frequent'
  
  // Symptoms
  symptoms: Symptom[]
  common_causes: Cause[]
  
  // Resolution
  solutions: Solution[]
  workarounds: Workaround[]
  escalation_procedures: EscalationStep[]
  
  // Prevention
  prevention_measures: PreventionMeasure[]
  maintenance_recommendations: string[]
  
  // Resources
  required_tools: string[]
  required_parts: Part[]
  estimated_resolution_time: number
  skill_level_required: 'basic' | 'intermediate' | 'advanced' | 'expert'
  
  // Documentation
  related_issues: string[]
  related_sops: string[]
  reference_materials: string[]
  
  // Tracking
  created_date: Date
  last_updated: Date
  resolution_success_rate: number
  average_resolution_time: number
}

interface Solution {
  solution_id: string
  solution_title: string
  step_by_step_instructions: InstructionStep[]
  success_rate: number
  average_time: number
  required_skill_level: string
  safety_warnings: string[]
  quality_checks: string[]
}

class IssueLibraryProcessor {
  async processIssueLibrary(library: IssueLibrary): Promise<ProcessedDocument[]> {
    const documents: ProcessedDocument[] = []
    
    // Library overview
    documents.push({
      document_id: `issue_library_${library.library_id}`,
      source_type: 'issue_library',
      tenant_id: library.tenant_id,
      title: `${library.library_name} - Issue Resolution Library`,
      content: await this.generateIssueLibraryContent(library),
      entities: await this.extractIssueLibraryEntities(library),
      metadata: {
        library_id: library.library_id,
        issue_count: library.issues.length,
        category_count: library.categories.length
      },
      as_of: library.last_updated
    })
    
    // Individual issue documents
    for (const issue of library.issues) {
      documents.push({
        document_id: `issue_${issue.issue_id}`,
        source_type: 'issue_library',
        tenant_id: library.tenant_id,
        title: `Issue Resolution: ${issue.issue_title}`,
        content: await this.generateIssueContent(issue),
        entities: await this.extractIssueEntities(issue),
        metadata: {
          issue_id: issue.issue_id,
          category: issue.category,
          severity: issue.severity,
          success_rate: issue.resolution_success_rate,
          avg_resolution_time: issue.average_resolution_time
        },
        as_of: issue.last_updated
      })
    }
    
    return documents
  }
  
  private async generateIssueContent(issue: Issue): Promise<string> {
    return `
Issue: ${issue.issue_title}
Category: ${issue.category}${issue.subcategory ? ` > ${issue.subcategory}` : ''}
Severity: ${issue.severity}
Frequency: ${issue.frequency}

DESCRIPTION:
${issue.issue_description}

SYMPTOMS:
${issue.symptoms.map(symptom => 
  `- ${symptom.description} (${symptom.frequency})`
).join('\n')}

COMMON CAUSES:
${issue.common_causes.map(cause => 
  `- ${cause.description} (${cause.probability}% likelihood)`
).join('\n')}

SOLUTIONS:
${issue.solutions.map((solution, index) => `
${index + 1}. ${solution.solution_title}
   Success Rate: ${solution.success_rate}%
   Average Time: ${solution.average_time} minutes
   Skill Level: ${solution.required_skill_level}
   
   Steps:
${solution.step_by_step_instructions.map((step, stepIndex) => 
   `   ${stepIndex + 1}. ${step.description}${step.estimated_time ? ` (${step.estimated_time} min)` : ''}`
).join('\n')}
   
   ${solution.safety_warnings.length > 0 ? `Safety Warnings: ${solution.safety_warnings.join('; ')}` : ''}
   ${solution.quality_checks.length > 0 ? `Quality Checks: ${solution.quality_checks.join('; ')}` : ''}
`).join('\n')}

WORKAROUNDS:
${issue.workarounds.map(workaround => 
  `- ${workaround.description} (Temporary solution, ${workaround.duration})`
).join('\n')}

PREVENTION:
${issue.prevention_measures.map(measure => 
  `- ${measure.description} (${measure.frequency})`
).join('\n')}

REQUIRED RESOURCES:
- Tools: ${issue.required_tools.join(', ')}
- Parts: ${issue.required_parts.map(part => `${part.name} (${part.part_number})`).join(', ')}
- Skill Level: ${issue.skill_level_required}
- Estimated Resolution Time: ${issue.estimated_resolution_time} minutes

RELATED INFORMATION:
- Related Issues: ${issue.related_issues.join(', ')}
- Related SOPs: ${issue.related_sops.join(', ')}
- Reference Materials: ${issue.reference_materials.join(', ')}

PERFORMANCE METRICS:
- Resolution Success Rate: ${issue.resolution_success_rate}%
- Average Resolution Time: ${issue.average_resolution_time} minutes

Last Updated: ${issue.last_updated.toDateString()}
    `.trim()
  }
}
```

This comprehensive data source configuration ensures that all business-critical information is properly ingested, processed, and made available for intelligent retrieval in the Thorbis RAG system.
