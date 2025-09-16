/**
 * Financial Compliance Reports API
 * Generate regulatory reports for various financial compliance requirements
 * 
 * Features: Form 941, Form 944, Schedule C, state compliance, industry-specific reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Compliance report generation schema
const ComplianceReportSchema = z.object({
  organization_id: z.string().uuid(),
  report_type: z.enum([
    'form_941',           // Quarterly federal tax return
    'form_944',           // Annual federal tax return (small employers)
    'schedule_c',         // Profit/loss from business
    'form_1120',          // Corporate income tax
    'state_unemployment', // State unemployment reports
    'workers_comp',       // Workers compensation reports
    'industry_specific',  // Industry-specific compliance
    'cash_transaction',   // Cash transaction reports (BSA)
    'beneficial_ownership' // Beneficial ownership information
  ]),
  reporting_period: z.object({
    period_type: z.enum(['monthly', 'quarterly', 'annual']),
    year: z.number().int().min(2020).max(new Date().getFullYear()),
    quarter: z.number().int().min(1).max(4).optional(),
    month: z.number().int().min(1).max(12).optional()
  }),
  filters: z.object({
    include_zero_amounts: z.boolean().default(false),
    employee_count_threshold: z.number().int().optional(),
    revenue_threshold_cents: z.number().int().optional(),
    state_jurisdictions: z.array(z.string()).optional()
  }).optional(),
  output_options: z.object({
    format: z.enum(['json', 'pdf', 'xml', 'csv']).default('json'),
    include_supporting_schedules: z.boolean().default(true),
    electronic_filing: z.boolean().default(false),
    preparer_info: z.object({
      name: z.string(),
      ptin: z.string().optional(),
      firm_name: z.string().optional()
    }).optional()
  }).optional()
});

const ComplianceValidationSchema = z.object({
  organization_id: z.string().uuid(),
  validation_type: z.enum([
    'payroll_tax_reconciliation',
    'quarterly_estimates',
    'annual_reconciliation',
    'industry_compliance',
    'multi_state_nexus'
  ]),
  period: z.object({
    start_date: z.string(),
    end_date: z.string()
  })
});

// GET /api/v1/compliance/reports - List compliance requirements and due dates
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const reportType = searchParams.get('report_type');
    const year = searchParams.get('year');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    // Get organization details to determine compliance requirements
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('
        id,
        name,
        industry,
        business_address,
        tax_id,
        settings,
        payroll_settings:payroll_settings(
          employee_count,
          quarterly_wages_cents,
          federal_tax_deposits
        )
      ')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Determine compliance requirements based on organization profile
    const complianceRequirements = await determineComplianceRequirements(organization);

    // Get recent compliance reports
    const { data: recentReports } = await supabase
      .from('compliance_reports')
      .select('
        id,
        report_type,
        reporting_period,
        status,
        filed_date,
        due_date,
        created_at
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate upcoming deadlines
    const upcomingDeadlines = calculateUpcomingDeadlines(complianceRequirements, new Date());

    return NextResponse.json({
      data: {
        compliance_profile: {
          organization_type: determineOrganizationType(organization),
          employee_count: organization.payroll_settings?.[0]?.employee_count || 0,
          industry_codes: getIndustryComplianceCodes(organization.industry),
          federal_requirements: complianceRequirements.federal,
          state_requirements: complianceRequirements.state,
          industry_requirements: complianceRequirements.industry
        },
        recent_reports: recentReports?.map(report => ({
          ...report,
          display_info: {
            report_name: getReportDisplayName(report.report_type),
            period_display: formatReportingPeriod(report.reporting_period),
            status_display: formatReportStatus(report.status),
            days_until_due: calculateDaysUntilDue(report.due_date)
          }
        })) || [],
        upcoming_deadlines: upcomingDeadlines,
        compliance_score: calculateComplianceScore(recentReports || [], upcomingDeadlines)
      },
      meta: {
        organization_id: organizationId,
        assessment_date: new Date().toISOString(),
        next_review_date: getNextReviewDate()
      }
    });

  } catch (error) {
    console.error('Compliance reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve compliance information' },
      { status: 500 }
    );
  }
}

// POST /api/v1/compliance/reports - Generate compliance report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = ComplianceReportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid compliance report request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, report_type, reporting_period, filters = {}, output_options = {} } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Get organization and financial data
    const organizationData = await getOrganizationFinancialData(organization_id, reporting_period);
    
    if (!organizationData) {
      return NextResponse.json(
        { error: 'Organization not found or insufficient data' },
        { status: 404 }
      );
    }

    // Generate the specific compliance report
    const reportData = await generateComplianceReport({
      organization: organizationData,
      report_type,
      reporting_period,
      filters,
      output_options
    });

    // Store the report record
    const { data: reportRecord } = await supabase
      .from('compliance_reports')
      .insert({
        organization_id,
        report_type,
        reporting_period,
        report_data: reportData,
        filters,
        status: output_options.electronic_filing ? 'filed_electronically' : 'generated',
        due_date: calculateReportDueDate(report_type, reporting_period),
        generated_by: 'api', // In real app, use authenticated user
        generated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    return NextResponse.json({
      data: {
        report_id: reportRecord?.id,
        report_type,
        reporting_period,
        report_data: reportData,
        filing_info: {
          due_date: calculateReportDueDate(report_type, reporting_period),
          filing_method: output_options.electronic_filing ? 'electronic' : 'paper',
          estimated_tax_liability: reportData.summary?.tax_liability_cents || 0,
          penalties_if_late: calculateLatePenalties(report_type, reportData.summary?.tax_liability_cents || 0)
        },
        download_urls: output_options.format === 'pdf' ? [reportData.pdf_url] : undefined
      },
      meta: {
        generated_at: new Date().toISOString(),
        compliance_notes: getComplianceNotes(report_type, reporting_period),
        next_steps: getNextSteps(report_type, output_options.electronic_filing)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Compliance report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/compliance/reports/validate - Validate compliance data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = ComplianceValidationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid validation request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, validation_type, period } = validationResult.data;
    
    // Perform comprehensive compliance validation
    const validationResults = await performComplianceValidation({
      organization_id,
      validation_type,
      period
    });

    return NextResponse.json({
      data: {
        validation_type,
        period,
        overall_status: validationResults.overall_status,
        validation_score: validationResults.score,
        issues_found: validationResults.issues,
        recommendations: validationResults.recommendations,
        required_actions: validationResults.required_actions
      },
      meta: {
        validated_at: new Date().toISOString(),
        validation_criteria: getValidationCriteria(validation_type)
      }
    });

  } catch (error) {
    console.error('Compliance validation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform compliance validation' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function determineComplianceRequirements(organization: unknown) {
  const requirements = {
    federal: [],
    state: [],
    industry: []
  };

  // Federal requirements based on organization characteristics
  requirements.federal.push(
    { type: 'form_941', frequency: 'quarterly', description: 'Quarterly Federal Tax Return' },
    { type: 'form_1120', frequency: 'annual', description: 'Corporate Income Tax Return' }
  );

  // Add payroll-specific requirements if employees exist
  if (organization.payroll_settings?.[0]?.employee_count > 0) {
    requirements.federal.push(
      { type: 'form_940', frequency: 'annual', description: 'Federal Unemployment Tax' },
      { type: 'form_w2', frequency: 'annual', description: 'Employee Wage Statements' }
    );
  }

  // State requirements based on business address
  const state = organization.business_address?.state;
  if (state) {
    requirements.state.push(
      { type: 'state_income_tax', frequency: 'annual', jurisdiction: state },
      { type: 'state_sales_tax', frequency: 'monthly', jurisdiction: state }
    );
  }

  // Industry-specific requirements
  if (organization.industry) {
    const industryReqs = getIndustryRequirements(organization.industry);
    requirements.industry.push(...industryReqs);
  }

  return requirements;
}

async function generateComplianceReport(params: unknown) {
  const { organization, report_type, reporting_period, filters, output_options } = params;

  // Mock report generation - in production, this would:
  // 1. Pull actual financial data from database
  // 2. Calculate tax liabilities and deductions
  // 3. Generate proper government forms
  // 4. Handle electronic filing if requested

  const baseReport = {
    report_id: '${report_type}_${reporting_period.year}_${Date.now()}',
    organization_info: {
      name: organization.name,
      tax_id: organization.tax_id,
      address: organization.business_address
    },
    reporting_period,
    generated_at: new Date().toISOString()
  };

  switch (report_type) {
    case 'form_941':
      return {
        ...baseReport,
        form_type: 'Form 941',
        quarter: reporting_period.quarter,
        summary: {
          wages_subject_to_withholding_cents: 45000000, // $450,000
          federal_income_tax_withheld_cents: 5400000,   // $54,000
          social_security_wages_cents: 45000000,
          social_security_tax_cents: 5580000,           // $55,800
          medicare_wages_cents: 45000000,
          medicare_tax_cents: 1305000,                  // $13,050
          total_tax_liability_cents: 12285000,          // $122,850
          deposits_made_cents: 12285000,
          balance_due_cents: 0
        },
        schedule_b: generateScheduleB(reporting_period),
        pdf_url: '/api/v1/compliance/reports/form941_${reporting_period.year}_Q${reporting_period.quarter}.pdf'
      };

    case 'schedule_c':
      return {
        ...baseReport,
        form_type: 'Schedule C',
        summary: {
          gross_receipts_cents: 180000000,    // $1,800,000
          total_expenses_cents: 135000000,    // $1,350,000
          net_profit_cents: 45000000,         // $450,000
          self_employment_tax_cents: 6345000, // $63,450
          estimated_tax_payments_cents: 15000000
        },
        expense_categories: generateExpenseCategories(),
        pdf_url: '/api/v1/compliance/reports/schedule_c_${reporting_period.year}.pdf'
      };

    case 'state_unemployment':
      return {
        ...baseReport,
        form_type: 'State Unemployment Insurance',
        state: organization.business_address?.state,
        summary: {
          taxable_wages_cents: 42000000,      // $420,000
          sui_rate_percentage: 3.4,
          sui_tax_due_cents: 1428000,         // $14,280
          payments_made_cents: 1428000,
          balance_due_cents: 0
        }
      };

    case 'industry_specific':
      return generateIndustrySpecificReport(organization, reporting_period);

    default:
      return {
        ...baseReport,
        error: 'Report type ${report_type} not implemented'
      };
  }
}

function generateScheduleB(reportingPeriod: unknown) {
  // Generate monthly deposit schedule for Form 941
  const months = ['January', 'February', 'March'];
  const quarterStart = (reportingPeriod.quarter - 1) * 3;
  
  return months.map((month, index) => ({
    month: months[index],
    month_number: quarterStart + index + 1,
    tax_liability_cents: 4095000, // $40,950 per month
    deposits_made: [
      { date: '${reportingPeriod.year}-${String(quarterStart + index + 1).padStart(2, '0')}-15', amount_cents: 2047500 },
      { date: '${reportingPeriod.year}-${String(quarterStart + index + 1).padStart(2, '0')}-30', amount_cents: 2047500 }
    ]
  }));
}

function generateExpenseCategories() {
  return [
    { category: 'Advertising', amount_cents: 5000000 },         // $50,000
    { category: 'Car and truck expenses', amount_cents: 8000000 }, // $80,000
    { category: 'Office expenses', amount_cents: 12000000 },    // $120,000
    { category: 'Professional services', amount_cents: 25000000 }, // $250,000
    { category: 'Supplies', amount_cents: 15000000 },           // $150,000
    { category: 'Travel', amount_cents: 7000000 },              // $70,000
    { category: 'Utilities', amount_cents: 18000000 },          // $180,000
    { category: 'Insurance', amount_cents: 22000000 },          // $220,000
    { category: 'Legal and professional', amount_cents: 15000000 }, // $150,000
    { category: 'Office rent', amount_cents: 48000000 }         // $480,000
  ];
}

function generateIndustrySpecificReport(organization: unknown, reportingPeriod: unknown) {
  const industryReports: { [key: string]: any } = {
    'hs': {
      report_name: 'Home Services Industry Compliance Report',
      licensing_requirements: [
        { license_type: 'Contractor License', status: 'active', expires: '2024-12-31' },
        { license_type: 'Business License', status: 'active', expires: '2024-06-30' }
      ],
      insurance_compliance: {
        general_liability: { status: 'current', coverage: 100000000 }, // $1M
        workers_comp: { status: 'current', coverage: 50000000 }        // $500K
      },
      safety_reporting: {
        osha_incidents: 0,
        safety_training_completed: true,
        last_inspection: '2024-01-15'
      }
    },
    'auto': {
      report_name: 'Automotive Services Compliance Report',
      environmental_compliance: {
        waste_oil_disposal: { status: 'compliant', last_report: '2024-01-31' },
        hazardous_materials: { permits_current: true, inspection_date: '2024-01-10' }
      },
      certifications: [
        { type: 'ASE Certification', status: 'current', technicians: 5 },
        { type: 'EPA Certification', status: 'current', expires: '2025-03-31' }
      ]
    },
    'rest': {
      report_name: 'Restaurant Industry Compliance Report',
      health_department: {
        permit_status: 'active',
        last_inspection: '2024-01-20',
        score: 95,
        violations: 0
      },
      alcohol_license: {
        status: 'active',
        type: 'Beer and Wine',
        expires: '2024-11-30'
      },
      labor_compliance: {
        tip_reporting: { status: 'current', last_filed: '2024-01-31' },
        minimum_wage_compliance: true
      }
    }
  };

  return industryReports[organization.industry] || {
    report_name: 'General Business Compliance Report',
    status: 'No industry-specific requirements identified'
  };
}

async function getOrganizationFinancialData(organizationId: string, reportingPeriod: unknown) {
  // Mock financial data fetch - in production, this would pull from database
  return {
    id: organizationId,
    name: 'Demo Business Corp',
    tax_id: '12-3456789',
    business_address: {
      street: '123 Business St',
      city: 'Los Angeles',
      state: 'CA',
      postal_code: '90210'
    },
    industry: 'hs'
  };
}

function calculateUpcomingDeadlines(requirements: unknown, currentDate: Date) {
  const deadlines = [];
  const year = currentDate.getFullYear();
  const quarter = Math.floor(currentDate.getMonth() / 3) + 1;

  // Add federal quarterly deadlines
  deadlines.push({
    report_type: 'form_941',
    description: 'Quarterly Federal Tax Return',
    due_date: getQuarterlyDueDate(year, quarter),
    priority: 'high',
    estimated_preparation_time: '2-4 hours'
  });

  // Add annual deadlines
  if (currentDate.getMonth() >= 10) { // November or December
    deadlines.push({
      report_type: 'form_1120',
      description: 'Corporate Income Tax Return',
      due_date: '${year + 1}-03-15',
      priority: 'high',
      estimated_preparation_time: '8-16 hours`
    });
  }

  return deadlines.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

function getQuarterlyDueDate(year: number, quarter: number): string {
  const dueDates = [
    `${year}-04-30`, // Q1
    `${year}-07-31`, // Q2
    `${year}-10-31', // Q3
    '${year + 1}-01-31' // Q4
  ];
  return dueDates[quarter - 1];
}

function calculateReportDueDate(reportType: string, reportingPeriod: unknown): string {
  const dueDateMap: { [key: string]: string } = {
    'form_941': getQuarterlyDueDate(reportingPeriod.year, reportingPeriod.quarter || 1),
    'form_944': '${reportingPeriod.year + 1}-01-31',
    'schedule_c': '${reportingPeriod.year + 1}-04-15',
    'form_1120': '${reportingPeriod.year + 1}-03-15',
    'state_unemployment`: `${reportingPeriod.year + 1}-01-31'
  };

  return dueDateMap[reportType] || '${reportingPeriod.year + 1}-04-15';
}

function calculateLatePenalties(reportType: string, taxLiabilityCents: number): unknown {
  // Simplified penalty calculations - actual penalties are more complex
  const penaltyRates: { [key: string]: number } = {
    'form_941': 0.05,  // 5% per month
    'form_1120': 0.045, // 4.5% per month
    'schedule_c': 0.05  // 5% per month
  };

  const rate = penaltyRates[reportType] || 0.05;
  const monthlyPenalty = Math.floor(taxLiabilityCents * rate);

  return {
    first_month_penalty_cents: monthlyPenalty,
    maximum_penalty_cents: Math.floor(taxLiabilityCents * 0.25), // 25% max
    daily_interest_rate: 0.0001 // Approximate daily rate
  };
}

function getComplianceNotes(reportType: string, reportingPeriod: unknown): string[] {
  const commonNotes = [
    'Ensure all supporting documentation is retained for audit purposes',
    'Consider electronic filing for faster processing and confirmation',
    'Review all calculations before submitting'
  ];

  const specificNotes: { [key: string]: string[] } = {
    'form_941': [
      'Deposits must be made on time to avoid penalties',
      'Reconcile quarterly totals with annual forms',
      'Schedule B may be required for large employers'
    ],
    'schedule_c': [
      'Business use of home deduction may apply',
      'Keep detailed records of business expenses',
      'Consider quarterly estimated tax payments'
    ]
  };

  return [...commonNotes, ...(specificNotes[reportType] || [])];
}

function getNextSteps(reportType: string, electronicFiling: boolean): string[] {
  const steps = [];

  if (electronicFiling) {
    steps.push('Report has been filed electronically');
    steps.push('Check for electronic confirmation within 24-48 hours');
  } else {
    steps.push('Print and sign the completed forms');
    steps.push('Mail forms to the appropriate IRS processing center');
    steps.push('Consider certified mail for proof of delivery');
  }

  steps.push('Make required tax payments by the due date');
  steps.push('Update compliance calendar for next reporting period');

  return steps;
}

// Additional helper functions...
function determineOrganizationType(organization: unknown): string {
  // Simplified organization type determination
  return 'C Corporation'; // Would be based on actual tax structure
}

function getIndustryComplianceCodes(industry: string): string[] {
  const codes: { [key: string]: string[] } = {
    'hs': ['NAICS 238', 'SIC 1799'],
    'auto': ['NAICS 811', 'SIC 7538'],
    'rest': ['NAICS 722', 'SIC 5812'],
    'ret': ['NAICS 447', 'SIC 5541']
  };
  return codes[industry] || [];
}

function getIndustryRequirements(industry: string): unknown[] {
  const requirements: { [key: string]: unknown[] } = {
    'hs': [
      { type: 'contractor_license_renewal', frequency: 'annual' },
      { type: 'workers_comp_audit', frequency: 'annual' }
    ],
    'auto': [
      { type: 'epa_compliance_report', frequency: 'quarterly' },
      { type: 'hazmat_certification', frequency: 'annual' }
    ],
    'rest': [
      { type: 'health_permit_renewal', frequency: 'annual' },
      { type: 'alcohol_license_renewal', frequency: 'annual' }
    ]
  };
  return requirements[industry] || [];
}

function getReportDisplayName(reportType: string): string {
  const displayNames: { [key: string]: string } = {
    'form_941': 'Form 941 - Quarterly Federal Tax Return',
    'form_944': 'Form 944 - Annual Federal Tax Return',
    'schedule_c': 'Schedule C - Profit or Loss from Business',
    'form_1120': 'Form 1120 - Corporate Income Tax Return',
    'state_unemployment': 'State Unemployment Insurance Report'
  };
  return displayNames[reportType] || reportType;
}

function formatReportingPeriod(period: unknown): string {
  if (period.quarter) {
    return 'Q${period.quarter} ${period.year}';
  }
  if (period.month) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec`];
    return `${monthNames[period.month - 1]} ${period.year}';
  }
  return 'Year ${period.year}';
}

function formatReportStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'generated': 'Ready to File',
    'filed_electronically': 'Filed (Electronic)',
    'filed_paper': 'Filed (Paper)',
    'pending': 'In Progress',
    'overdue': 'Overdue'
  };
  return statusMap[status] || status;
}

function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateComplianceScore(recentReports: unknown[], upcomingDeadlines: unknown[]): number {
  // Simplified compliance score calculation
  const score = 100;
  
  // Deduct points for overdue reports
  const overdueReports = recentReports.filter(report => 
    report.status === 'overdue' || calculateDaysUntilDue(report.due_date) < 0
  );
  score -= overdueReports.length * 15;

  // Deduct points for upcoming deadlines within 7 days
  const urgentDeadlines = upcomingDeadlines.filter(deadline => 
    calculateDaysUntilDue(deadline.due_date) <= 7
  );
  score -= urgentDeadlines.length * 5;

  return Math.max(0, Math.min(100, score));
}

function getNextReviewDate(): string {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().split('T')[0];
}

function getValidationCriteria(validationType: string): string[] {
  const criteria: { [key: string]: string[] } = {
    'payroll_tax_reconciliation': [
      'Verify payroll tax deposits match reported liabilities',
      'Check for proper tax withholding calculations',
      'Ensure quarterly reports reconcile with annual totals'
    ],
    'quarterly_estimates': [
      'Calculate required estimated tax payments',
      'Verify safe harbor rules compliance',
      'Check for underpayment penalties'
    ]
  };
  return criteria[validationType] || [];
}

async function performComplianceValidation(params: unknown): Promise<unknown> {
  // Mock validation - in production, this would perform actual data validation
  return {
    overall_status: 'compliant',
    score: 95,
    issues: [
      {
        severity: 'warning',
        category: 'quarterly_estimates',
        description: 'Q4 estimated tax payment may be slightly low',
        recommended_action: 'Consider increasing Q4 payment by $2,500'
      }
    ],
    recommendations: [
      'Set up automatic reminders for quarterly filing deadlines',
      'Consider electronic filing for faster processing'
    ],
    required_actions: []
  };
}