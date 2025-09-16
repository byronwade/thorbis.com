/**
 * GraphQL Type Definitions for Payroll Services
 * Comprehensive types for employees, timesheets, pay periods, deductions, tax calculations, benefits, compliance
 */

export const payrollTypeDefs = `
# Payroll Services Core Types

# Employee Management
type Employee implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Personal Information
  firstName: String!
  lastName: String!
  fullName: String!
  middleName: String
  email: String!
  phone: String
  dateOfBirth: DateTime
  socialSecurityNumber: String # Encrypted/hashed
  address: Address
  emergencyContact: EmergencyContact
  
  # Employment Details
  employeeId: String!
  departmentId: ID
  department: Department
  positionId: ID
  position: Position
  managerId: ID
  manager: Employee
  
  # Employment Status
  status: EmployeeStatus!
  employmentType: EmploymentType!
  hireDate: DateTime!
  terminationDate: DateTime
  rehireDate: DateTime
  
  # Compensation
  payType: PayType!
  payRate: Float!
  currency: String!
  paySchedule: PaySchedule!
  salaryBasis: SalaryBasis
  annualSalary: Float
  hourlyRate: Float
  
  # Work Information
  workLocation: String
  timezone: String!
  defaultHoursPerDay: Float!
  defaultHoursPerWeek: Float!
  maxHoursPerWeek: Float
  isExempt: Boolean!
  exemptionReason: String
  
  # Tax and Legal
  taxInformation: TaxInformation
  w4Information: W4Information
  i9Status: I9Status
  workEligibility: WorkEligibility!
  
  # Benefits
  benefitEnrollments: [BenefitEnrollment!]!
  payrollDeductions: [PayrollDeduction!]!
  
  # Time and Attendance
  timesheets(
    payPeriodId: ID
    startDate: DateTime
    endDate: DateTime
    status: TimesheetStatus
    pagination: PaginationInput
    filters: [FilterInput!]
    sorts: [SortInput!]
  ): TimesheetConnection!
  
  # Pay History
  paystubs(
    payPeriodId: ID
    year: Int
    pagination: PaginationInput
    sorts: [SortInput!]
  ): PaystubConnection!
  
  # Performance and Reviews
  reviews: [PerformanceReview!]!
  goals: [EmployeeGoal!]!
  
  # Reporting
  directReports: [Employee!]!
  totalTimeWorked: Float! # Total hours across all time periods
  totalEarnings: Float! # Total earnings YTD
  totalTaxesPaid: Float! # Total taxes YTD
  
  # System Fields
  isActive: Boolean!
  lastLoginAt: DateTime
  profilePicture: String
  notes: String
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type EmployeeConnection {
  edges: [EmployeeEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type EmployeeEdge {
  cursor: String!
  node: Employee!
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  TERMINATED
  ON_LEAVE
  SUSPENDED
  RETIRED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
  TEMPORARY
  SEASONAL
  CONSULTANT
}

enum PayType {
  SALARY
  HOURLY
  COMMISSION
  PIECE_RATE
  CONTRACT
}

enum PaySchedule {
  WEEKLY
  BI_WEEKLY
  SEMI_MONTHLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}

enum SalaryBasis {
  ANNUAL
  MONTHLY
  WEEKLY
  DAILY
  HOURLY
}

type EmergencyContact {
  name: String!
  relationship: String!
  phone: String!
  alternatePhone: String
  email: String
  address: Address
}

type TaxInformation {
  filingStatus: FilingStatus!
  allowances: Int!
  additionalWithholding: Float
  exemptFromFederal: Boolean!
  exemptFromState: Boolean!
  exemptFromLocal: Boolean!
  stateOfResidence: String
  localityCode: String
}

type W4Information {
  filingStatus: FilingStatus!
  multipleJobs: Boolean!
  dependentAmount: Float
  otherIncome: Float
  deductions: Float
  additionalWithholding: Float
  signedDate: DateTime!
}

enum FilingStatus {
  SINGLE
  MARRIED_FILING_JOINTLY
  MARRIED_FILING_SEPARATELY
  HEAD_OF_HOUSEHOLD
  QUALIFYING_WIDOW
}

enum I9Status {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  EXPIRED
  REVERIFICATION_REQUIRED
}

enum WorkEligibility {
  US_CITIZEN
  PERMANENT_RESIDENT
  WORK_AUTHORIZED
  NOT_AUTHORIZED
}

# Timesheet Management
type Timesheet implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  employeeId: ID!
  employee: Employee!
  payPeriodId: ID!
  payPeriod: PayPeriod!
  
  # Status and Workflow
  status: TimesheetStatus!
  submittedAt: DateTime
  approvedAt: DateTime
  approvedBy: Employee
  rejectedAt: DateTime
  rejectionReason: String
  
  # Time Entries
  timeEntries: [TimeEntry!]!
  
  # Totals and Calculations
  totalHours: Float!
  regularHours: Float!
  overtimeHours: Float!
  doubleTimeHours: Float!
  ptoHours: Float!
  sickHours: Float!
  holidayHours: Float!
  
  # Rates and Earnings
  regularRate: Float!
  overtimeRate: Float!
  doubleTimeRate: Float!
  totalEarnings: Float!
  
  # Approval Chain
  approvalChain: [TimesheetApproval!]!
  
  # System Fields
  isLocked: Boolean!
  lockReason: String
  notes: String
  attachments: [String!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type TimesheetConnection {
  edges: [TimesheetEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type TimesheetEdge {
  cursor: String!
  node: Timesheet!
}

enum TimesheetStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  PAID
  LOCKED
}

type TimeEntry {
  id: ID!
  date: DateTime!
  clockIn: DateTime
  clockOut: DateTime
  hoursWorked: Float!
  breakTime: Float
  timeType: TimeType!
  payCode: String
  description: String
  project: String
  costCenter: String
  location: String
  
  # Approval
  isApproved: Boolean!
  approvedBy: Employee
  
  # System
  isEditable: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TimeType {
  REGULAR
  OVERTIME
  DOUBLE_TIME
  PTO
  SICK
  HOLIDAY
  BEREAVEMENT
  JURY_DUTY
  UNPAID
}

type TimesheetApproval {
  id: ID!
  approverId: ID!
  approver: Employee!
  status: ApprovalStatus!
  submittedAt: DateTime!
  respondedAt: DateTime
  comments: String
  level: Int!
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  DELEGATED
}

# Pay Period Management
type PayPeriod implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Period Information
  name: String!
  startDate: DateTime!
  endDate: DateTime!
  payDate: DateTime!
  cutoffDate: DateTime!
  
  # Status
  status: PayPeriodStatus!
  
  # Payroll Processing
  timesheets(
    employeeId: ID
    status: TimesheetStatus
    pagination: PaginationInput
  ): TimesheetConnection!
  
  payruns: [Payrun!]!
  
  # Summary Information
  employeeCount: Int!
  totalHours: Float!
  totalEarnings: Float!
  totalDeductions: Float!
  totalTaxes: Float!
  netPay: Float!
  
  # Processing Flags
  isProcessed: Boolean!
  processedAt: DateTime
  processedBy: Employee
  isLocked: Boolean!
  lockReason: String
  
  # System Fields
  notes: String
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PayPeriodConnection {
  edges: [PayPeriodEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PayPeriodEdge {
  cursor: String!
  node: PayPeriod!
}

enum PayPeriodStatus {
  DRAFT
  OPEN
  CLOSED
  PROCESSING
  PROCESSED
  PAID
  CANCELLED
}

# Payroll Processing
type Payrun implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  name: String!
  payPeriodId: ID!
  payPeriod: PayPeriod!
  runDate: DateTime!
  payDate: DateTime!
  
  # Status
  status: PayrunStatus!
  
  # Processing Information
  paystubs: [Paystub!]!
  employeeCount: Int!
  
  # Financial Summary
  totalGrossEarnings: Float!
  totalDeductions: Float!
  totalTaxes: Float!
  totalNetPay: Float!
  
  # Processing Details
  processedAt: DateTime
  processedBy: Employee
  approvedAt: DateTime
  approvedBy: Employee
  
  # Bank Processing
  bankFileGenerated: Boolean!
  bankFileGeneratedAt: DateTime
  bankFileStatus: BankFileStatus
  
  # System Fields
  isTest: Boolean!
  notes: String
  errors: [PayrollError!]!
  warnings: [PayrollWarning!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum PayrunStatus {
  DRAFT
  PROCESSING
  PROCESSED
  APPROVED
  PAID
  CANCELLED
  ERROR
}

enum BankFileStatus {
  PENDING
  GENERATED
  TRANSMITTED
  ACKNOWLEDGED
  PROCESSED
  REJECTED
}

type PayrollError {
  employeeId: ID
  employee: Employee
  errorType: String!
  message: String!
  field: String
  value: String
  severity: ErrorSeverity!
  createdAt: DateTime!
}

type PayrollWarning {
  employeeId: ID
  employee: Employee
  warningType: String!
  message: String!
  field: String
  value: String
  createdAt: DateTime!
}

enum ErrorSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

# Pay Stub and Earnings
type Paystub implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  employeeId: ID!
  employee: Employee!
  payrunId: ID!
  payrun: Payrun!
  payPeriodId: ID!
  payPeriod: PayPeriod!
  
  # Pay Information
  checkNumber: String
  payDate: DateTime!
  
  # Earnings
  earnings: [EarningLine!]!
  totalGrossEarnings: Float!
  
  # Deductions
  deductions: [DeductionLine!]!
  totalDeductions: Float!
  
  # Taxes
  taxes: [TaxLine!]!
  totalTaxes: Float!
  
  # Net Pay
  netPay: Float!
  
  # Year-to-Date Totals
  ytdGrossEarnings: Float!
  ytdDeductions: Float!
  ytdTaxes: Float!
  ytdNetPay: Float!
  
  # Direct Deposit
  directDeposits: [DirectDeposit!]!
  
  # Status
  status: PaystubStatus!
  voidedAt: DateTime
  voidReason: String
  
  # System Fields
  isVoided: Boolean!
  pdfUrl: String
  notes: String
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PaystubConnection {
  edges: [PaystubEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PaystubEdge {
  cursor: String!
  node: Paystub!
}

enum PaystubStatus {
  DRAFT
  PROCESSED
  PAID
  VOIDED
  CANCELLED
}

type EarningLine {
  id: ID!
  earningType: EarningType!
  description: String!
  hours: Float
  rate: Float!
  amount: Float!
  ytdAmount: Float!
}

type DeductionLine {
  id: ID!
  deductionType: PayrollDeduction!
  description: String!
  amount: Float!
  ytdAmount: Float!
  employerAmount: Float
  ytdEmployerAmount: Float
}

type TaxLine {
  id: ID!
  taxType: TaxType!
  description: String!
  taxableWages: Float!
  rate: Float
  amount: Float!
  ytdTaxableWages: Float!
  ytdAmount: Float!
  employerAmount: Float
  ytdEmployerAmount: Float
}

type DirectDeposit {
  id: ID!
  accountType: BankAccountType!
  accountNumber: String! # Masked
  routingNumber: String! # Masked
  bankName: String!
  amount: Float!
  isRemainder: Boolean!
  percentage: Float
  priority: Int!
}

enum BankAccountType {
  CHECKING
  SAVINGS
}

# Earning Types and Rates
type EarningType implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  name: String!
  code: String!
  description: String
  category: EarningCategory!
  
  # Rate Information
  isHourly: Boolean!
  defaultRate: Float
  multiplier: Float # For overtime calculations
  
  # Tax and Legal
  isTaxable: Boolean!
  subjectToFICA: Boolean!
  subjectToFUTA: Boolean!
  subjectToSUTA: Boolean!
  subjectToSDI: Boolean!
  
  # Accounting
  glAccount: String
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum EarningCategory {
  REGULAR
  OVERTIME
  DOUBLE_TIME
  BONUS
  COMMISSION
  HOLIDAY
  PTO
  SICK
  BEREAVEMENT
  JURY_DUTY
  OTHER
}

# Payroll Deductions
type PayrollDeduction implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  name: String!
  code: String!
  description: String
  category: DeductionCategory!
  
  # Calculation
  calculationType: CalculationType!
  amount: Float
  percentage: Float
  limit: Float
  annualLimit: Float
  
  # Employee/Employer Split
  employeeContribution: Float
  employerContribution: Float
  employerMatch: Boolean!
  matchPercentage: Float
  matchLimit: Float
  
  # Tax Treatment
  preTax: Boolean!
  affectsFederalTax: Boolean!
  affectsStateTax: Boolean!
  affectsFICA: Boolean!
  affectsFUTA: Boolean!
  affectsSUTA: Boolean!
  
  # Frequency and Timing
  frequency: DeductionFrequency!
  startDate: DateTime
  endDate: DateTime
  
  # Accounting
  glAccount: String
  vendorId: String
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum DeductionCategory {
  HEALTH_INSURANCE
  DENTAL_INSURANCE
  VISION_INSURANCE
  LIFE_INSURANCE
  DISABILITY_INSURANCE
  RETIREMENT_401K
  RETIREMENT_403B
  RETIREMENT_IRA
  HSA
  FSA
  COMMUTER_BENEFITS
  UNION_DUES
  GARNISHMENT
  CHILD_SUPPORT
  LOAN_REPAYMENT
  CHARITY
  PARKING
  OTHER
}

enum CalculationType {
  FIXED_AMOUNT
  PERCENTAGE
  PERCENTAGE_OF_GROSS
  PERCENTAGE_OF_NET
  TIERED
  PER_HOUR
}

enum DeductionFrequency {
  EVERY_PAY
  MONTHLY
  QUARTERLY
  ANNUALLY
  ONE_TIME
}

# Benefits Management
type BenefitPlan implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Plan Information
  name: String!
  planType: BenefitPlanType!
  carrier: String
  policyNumber: String
  planYear: Int!
  
  # Coverage Details
  coverageLevels: [CoverageLevel!]!
  eligibilityRules: [EligibilityRule!]!
  
  # Costs
  employeeCosts: [BenefitCost!]!
  employerCosts: [BenefitCost!]!
  
  # Enrollment
  enrollments: [BenefitEnrollment!]!
  
  # Dates
  effectiveDate: DateTime!
  terminationDate: DateTime
  enrollmentPeriodStart: DateTime!
  enrollmentPeriodEnd: DateTime!
  
  # Status
  isActive: Boolean!
  
  # System Fields
  description: String
  documents: [String!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BenefitEnrollment implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  employeeId: ID!
  employee: Employee!
  benefitPlanId: ID!
  benefitPlan: BenefitPlan!
  
  # Coverage
  coverageLevel: CoverageLevel!
  dependents: [Dependent!]!
  
  # Elections
  employeeElection: Float
  employerContribution: Float
  
  # Dates
  effectiveDate: DateTime!
  terminationDate: DateTime
  
  # Status
  status: EnrollmentStatus!
  
  # System Fields
  notes: String
  documents: [String!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum BenefitPlanType {
  HEALTH_MEDICAL
  HEALTH_DENTAL
  HEALTH_VISION
  LIFE_INSURANCE
  DISABILITY_SHORT_TERM
  DISABILITY_LONG_TERM
  RETIREMENT_401K
  RETIREMENT_403B
  HSA
  FSA
  COMMUTER
  OTHER
}

type CoverageLevel {
  id: ID!
  name: String!
  code: String!
  description: String
  maxCoverage: Float
}

type EligibilityRule {
  id: ID!
  ruleName: String!
  ruleType: EligibilityRuleType!
  value: String!
  operator: ComparisonOperator!
}

enum EligibilityRuleType {
  EMPLOYMENT_TYPE
  HOURS_WORKED
  TENURE
  DEPARTMENT
  POSITION
  AGE
  SALARY
}

enum ComparisonOperator {
  EQUALS
  NOT_EQUALS
  GREATER_THAN
  LESS_THAN
  GREATER_THAN_OR_EQUAL
  LESS_THAN_OR_EQUAL
  CONTAINS
  IN
}

type BenefitCost {
  id: ID!
  coverageLevelId: ID!
  coverageLevel: CoverageLevel!
  payPeriodCost: Float!
  monthlyCost: Float!
  annualCost: Float!
}

type Dependent {
  id: ID!
  firstName: String!
  lastName: String!
  relationship: DependentRelationship!
  dateOfBirth: DateTime!
  socialSecurityNumber: String
  isStudent: Boolean!
}

enum DependentRelationship {
  SPOUSE
  CHILD
  STEPCHILD
  ADOPTED_CHILD
  DOMESTIC_PARTNER
  OTHER
}

enum EnrollmentStatus {
  ACTIVE
  TERMINATED
  SUSPENDED
  PENDING
  COBRA
}

# Tax Management
type TaxRate implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Tax Information
  taxType: TaxType!
  name: String!
  code: String!
  jurisdiction: String!
  
  # Rate Details
  rate: Float!
  flatAmount: Float
  wageBase: Float
  minWage: Float
  maxWage: Float
  
  # Applicability
  employeeRate: Float!
  employerRate: Float!
  
  # Date Range
  effectiveDate: DateTime!
  endDate: DateTime
  taxYear: Int!
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TaxType {
  # Federal
  FEDERAL_INCOME_TAX
  FEDERAL_SOCIAL_SECURITY
  FEDERAL_MEDICARE
  FEDERAL_UNEMPLOYMENT
  
  # State
  STATE_INCOME_TAX
  STATE_UNEMPLOYMENT
  STATE_DISABILITY_INSURANCE
  STATE_FAMILY_MEDICAL_LEAVE
  
  # Local
  LOCAL_INCOME_TAX
  LOCAL_OCCUPATION_TAX
  
  # Other
  OTHER
}

# Department and Position Management
type Department implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  name: String!
  code: String!
  description: String
  
  # Hierarchy
  parentDepartmentId: ID
  parentDepartment: Department
  subDepartments: [Department!]!
  
  # Management
  managerId: ID
  manager: Employee
  
  # Employees
  employees: [Employee!]!
  employeeCount: Int!
  
  # Budgeting
  budgetAmount: Float
  actualSpent: Float
  
  # Accounting
  glAccount: String
  costCenter: String
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Position implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  title: String!
  code: String!
  description: String
  
  # Department
  departmentId: ID
  department: Department
  
  # Compensation
  payGradeId: ID
  payGrade: PayGrade
  minSalary: Float
  maxSalary: Float
  targetSalary: Float
  
  # Employment Details
  isExempt: Boolean!
  jobLevel: Int
  reportsToPositionId: ID
  reportsToPosition: Position
  
  # Requirements
  requiredSkills: [String!]!
  preferredSkills: [String!]!
  education: String
  experience: String
  
  # Employees
  employees: [Employee!]!
  currentEmployeeCount: Int!
  maxEmployees: Int
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PayGrade implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  name: String!
  code: String!
  description: String
  
  # Pay Range
  minSalary: Float!
  maxSalary: Float!
  midpoint: Float!
  
  # Steps/Levels
  steps: [PayStep!]!
  
  # Currency
  currency: String!
  
  # Employees
  positions: [Position!]!
  employees: [Employee!]!
  
  # Status
  isActive: Boolean!
  
  # System Fields
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PayStep {
  id: ID!
  stepNumber: Int!
  stepName: String!
  salary: Float!
  percentile: Float!
}

# Performance Management
type PerformanceReview implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  employeeId: ID!
  employee: Employee!
  reviewerId: ID!
  reviewer: Employee!
  reviewPeriod: String!
  reviewType: ReviewType!
  
  # Status
  status: ReviewStatus!
  
  # Dates
  periodStartDate: DateTime!
  periodEndDate: DateTime!
  dueDate: DateTime!
  completedDate: DateTime
  
  # Ratings
  overallRating: Float
  goals: [ReviewGoal!]!
  competencies: [CompetencyRating!]!
  
  # Comments
  employeeComments: String
  reviewerComments: String
  managerComments: String
  hrComments: String
  
  # Development
  strengths: [String!]!
  areasForImprovement: [String!]!
  developmentPlan: [DevelopmentItem!]!
  
  # Compensation Impact
  raiseRecommended: Boolean!
  raiseAmount: Float
  raisePercentage: Float
  promotionRecommended: Boolean!
  newPositionId: ID
  
  # System Fields
  attachments: [String!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ReviewType {
  ANNUAL
  MID_YEAR
  QUARTERLY
  PROBATIONARY
  PROJECT_BASED
  EXIT
}

enum ReviewStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  APPROVED
  ARCHIVED
}

type ReviewGoal {
  id: ID!
  title: String!
  description: String!
  weight: Float!
  targetValue: String
  actualValue: String
  rating: Float!
  comments: String
}

type CompetencyRating {
  id: ID!
  competencyId: ID!
  competency: Competency!
  rating: Float!
  comments: String
}

type Competency {
  id: ID!
  name: String!
  description: String!
  category: String!
  weight: Float!
}

type DevelopmentItem {
  id: ID!
  title: String!
  description: String!
  dueDate: DateTime
  priority: Priority!
  status: DevelopmentStatus!
  completedDate: DateTime
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum DevelopmentStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ON_HOLD
}

type EmployeeGoal implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Basic Information
  employeeId: ID!
  employee: Employee!
  title: String!
  description: String!
  
  # Goal Details
  category: GoalCategory!
  priority: Priority!
  status: GoalStatus!
  
  # Timeline
  startDate: DateTime!
  targetDate: DateTime!
  completedDate: DateTime
  
  # Progress
  progress: Float! # 0-100
  milestones: [Milestone!]!
  
  # Measurement
  measurementType: MeasurementType!
  targetValue: String
  currentValue: String
  unit: String
  
  # Alignment
  alignsWithCompanyGoal: Boolean!
  companyGoalId: ID
  
  # System Fields
  notes: String
  attachments: [String!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum GoalCategory {
  PERFORMANCE
  DEVELOPMENT
  BEHAVIOR
  SKILL_BUILDING
  CAREER
  PROJECT
}

enum GoalStatus {
  DRAFT
  ACTIVE
  ON_TRACK
  AT_RISK
  COMPLETED
  CANCELLED
  OVERDUE
}

enum MeasurementType {
  QUANTITATIVE
  QUALITATIVE
  MILESTONE_BASED
  COMPLETION_BASED
}

type Milestone {
  id: ID!
  title: String!
  description: String
  targetDate: DateTime!
  completedDate: DateTime
  status: MilestoneStatus!
}

enum MilestoneStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

# Compliance and Reporting
type ComplianceReport implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  
  # Report Information
  reportType: ComplianceReportType!
  name: String!
  description: String
  
  # Time Period
  periodType: ReportPeriodType!
  startDate: DateTime!
  endDate: DateTime!
  year: Int!
  quarter: Int
  month: Int
  
  # Status
  status: ReportStatus!
  
  # Generation
  generatedAt: DateTime
  generatedBy: Employee
  
  # Data
  reportData: JSON!
  summary: ReportSummary
  
  # Filing
  filedAt: DateTime
  filedBy: Employee
  confirmationNumber: String
  
  # Files
  reportFile: String
  backupFiles: [String!]!
  
  # System Fields
  notes: String
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ComplianceReportType {
  FORM_941
  FORM_940
  W2_FORMS
  W3_FORM
  FORM_1099
  STATE_QUARTERLY
  STATE_ANNUAL
  LOCAL_ANNUAL
  EEO_1
  WORKERS_COMP
  UNEMPLOYMENT_REPORT
  NEW_HIRE_REPORT
}

enum ReportPeriodType {
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
  CUSTOM
}

enum ReportStatus {
  DRAFT
  GENERATING
  COMPLETED
  REVIEWED
  FILED
  AMENDED
  ERROR
}

type ReportSummary {
  totalEmployees: Int!
  totalWages: Float!
  totalTaxes: Float!
  totalDeductions: Float!
  keyMetrics: JSON!
}

# Input Types
input EmployeeInput {
  firstName: String!
  lastName: String!
  middleName: String
  email: String!
  phone: String
  dateOfBirth: DateTime
  socialSecurityNumber: String
  address: AddressInput
  emergencyContact: EmergencyContactInput
  
  # Employment
  employeeId: String!
  departmentId: ID
  positionId: ID
  managerId: ID
  employmentType: EmploymentType!
  hireDate: DateTime!
  
  # Compensation
  payType: PayType!
  payRate: Float!
  currency: String
  paySchedule: PaySchedule!
  salaryBasis: SalaryBasis
  annualSalary: Float
  hourlyRate: Float
  
  # Work Information
  workLocation: String
  timezone: String!
  defaultHoursPerDay: Float!
  defaultHoursPerWeek: Float!
  isExempt: Boolean!
  
  # Tax Information
  taxInformation: TaxInformationInput
  w4Information: W4InformationInput
  workEligibility: WorkEligibility!
  
  # System
  customFields: JSON
}

input EmergencyContactInput {
  name: String!
  relationship: String!
  phone: String!
  alternatePhone: String
  email: String
  address: AddressInput
}

input TaxInformationInput {
  filingStatus: FilingStatus!
  allowances: Int!
  additionalWithholding: Float
  exemptFromFederal: Boolean!
  exemptFromState: Boolean!
  exemptFromLocal: Boolean!
  stateOfResidence: String
  localityCode: String
}

input W4InformationInput {
  filingStatus: FilingStatus!
  multipleJobs: Boolean!
  dependentAmount: Float
  otherIncome: Float
  deductions: Float
  additionalWithholding: Float
  signedDate: DateTime!
}

input TimesheetInput {
  employeeId: ID!
  payPeriodId: ID!
  timeEntries: [TimeEntryInput!]!
  notes: String
}

input TimeEntryInput {
  date: DateTime!
  clockIn: DateTime
  clockOut: DateTime
  hoursWorked: Float!
  breakTime: Float
  timeType: TimeType!
  payCode: String
  description: String
  project: String
  costCenter: String
  location: String
}

input PayPeriodInput {
  name: String!
  startDate: DateTime!
  endDate: DateTime!
  payDate: DateTime!
  cutoffDate: DateTime!
  notes: String
}

input PayrollDeductionInput {
  name: String!
  code: String!
  description: String
  category: DeductionCategory!
  calculationType: CalculationType!
  amount: Float
  percentage: Float
  limit: Float
  annualLimit: Float
  employeeContribution: Float
  employerContribution: Float
  employerMatch: Boolean!
  matchPercentage: Float
  matchLimit: Float
  preTax: Boolean!
  frequency: DeductionFrequency!
  startDate: DateTime
  endDate: DateTime
  customFields: JSON
}

input BenefitPlanInput {
  name: String!
  planType: BenefitPlanType!
  carrier: String
  policyNumber: String
  planYear: Int!
  effectiveDate: DateTime!
  terminationDate: DateTime
  enrollmentPeriodStart: DateTime!
  enrollmentPeriodEnd: DateTime!
  description: String
  customFields: JSON
}

input DepartmentInput {
  name: String!
  code: String!
  description: String
  parentDepartmentId: ID
  managerId: ID
  budgetAmount: Float
  glAccount: String
  costCenter: String
  customFields: JSON
}

input PositionInput {
  title: String!
  code: String!
  description: String
  departmentId: ID
  payGradeId: ID
  minSalary: Float
  maxSalary: Float
  targetSalary: Float
  isExempt: Boolean!
  jobLevel: Int
  reportsToPositionId: ID
  requiredSkills: [String!]!
  preferredSkills: [String!]!
  education: String
  experience: String
  maxEmployees: Int
  customFields: JSON
}

# Query and Mutation Extensions (to be added to main schema)
extend type Query {
  # Employee Management
  employee(id: ID!): Employee
  employees(
    departmentId: ID
    positionId: ID
    managerId: ID
    status: EmployeeStatus
    employmentType: EmploymentType
    pagination: PaginationInput
    filters: [FilterInput!]
    sorts: [SortInput!]
  ): EmployeeConnection!
  
  # Timesheet Management
  timesheet(id: ID!): Timesheet
  timesheets(
    employeeId: ID
    payPeriodId: ID
    status: TimesheetStatus
    startDate: DateTime
    endDate: DateTime
    pagination: PaginationInput
    filters: [FilterInput!]
    sorts: [SortInput!]
  ): TimesheetConnection!
  
  # Pay Period Management
  payPeriod(id: ID!): PayPeriod
  payPeriods(
    status: PayPeriodStatus
    year: Int
    pagination: PaginationInput
    sorts: [SortInput!]
  ): PayPeriodConnection!
  
  # Payroll Processing
  payrun(id: ID!): Payrun
  payruns(
    payPeriodId: ID
    status: PayrunStatus
    pagination: PaginationInput
    sorts: [SortInput!]
  ): [Payrun!]!
  
  # Pay Stubs
  paystub(id: ID!): Paystub
  paystubs(
    employeeId: ID
    payPeriodId: ID
    payrunId: ID
    year: Int
    pagination: PaginationInput
    sorts: [SortInput!]
  ): PaystubConnection!
  
  # Benefits
  benefitPlan(id: ID!): BenefitPlan
  benefitPlans(
    planType: BenefitPlanType
    planYear: Int
    pagination: PaginationInput
    filters: [FilterInput!]
  ): [BenefitPlan!]!
  
  # Payroll Deductions
  payrollDeduction(id: ID!): PayrollDeduction
  payrollDeductions(
    category: DeductionCategory
    pagination: PaginationInput
    filters: [FilterInput!]
  ): [PayrollDeduction!]!
  
  # Organization
  department(id: ID!): Department
  departments(
    parentDepartmentId: ID
    pagination: PaginationInput
    filters: [FilterInput!]
  ): [Department!]!
  
  position(id: ID!): Position
  positions(
    departmentId: ID
    payGradeId: ID
    pagination: PaginationInput
    filters: [FilterInput!]
  ): [Position!]!
  
  # Tax Rates
  taxRates(
    taxType: TaxType
    jurisdiction: String
    taxYear: Int
    pagination: PaginationInput
  ): [TaxRate!]!
  
  # Compliance
  complianceReports(
    reportType: ComplianceReportType
    year: Int
    quarter: Int
    status: ReportStatus
    pagination: PaginationInput
  ): [ComplianceReport!]!
}

extend type Mutation {
  # Employee Management
  createEmployee(input: EmployeeInput!): Employee!
  updateEmployee(id: ID!, input: EmployeeInput!): Employee!
  terminateEmployee(id: ID!, terminationDate: DateTime!, reason: String): Employee!
  
  # Timesheet Management
  createTimesheet(input: TimesheetInput!): Timesheet!
  updateTimesheet(id: ID!, input: TimesheetInput!): Timesheet!
  submitTimesheet(id: ID!): Timesheet!
  approveTimesheet(id: ID!, comments: String): Timesheet!
  rejectTimesheet(id: ID!, reason: String!): Timesheet!
  
  # Pay Period Management
  createPayPeriod(input: PayPeriodInput!): PayPeriod!
  closePayPeriod(id: ID!): PayPeriod!
  reopenPayPeriod(id: ID!, reason: String!): PayPeriod!
  
  # Payroll Processing
  createPayrun(payPeriodId: ID!): Payrun!
  processPayroll(payrunId: ID!): Payrun!
  approvePayroll(payrunId: ID!): Payrun!
  generateBankFile(payrunId: ID!): Payrun!
  
  # Benefits
  createBenefitPlan(input: BenefitPlanInput!): BenefitPlan!
  updateBenefitPlan(id: ID!, input: BenefitPlanInput!): BenefitPlan!
  enrollEmployeeInBenefit(employeeId: ID!, benefitPlanId: ID!, coverageLevel: ID!): BenefitEnrollment!
  
  # Payroll Deductions
  createPayrollDeduction(input: PayrollDeductionInput!): PayrollDeduction!
  updatePayrollDeduction(id: ID!, input: PayrollDeductionInput!): PayrollDeduction!
  
  # Organization
  createDepartment(input: DepartmentInput!): Department!
  updateDepartment(id: ID!, input: DepartmentInput!): Department!
  
  createPosition(input: PositionInput!): Position!
  updatePosition(id: ID!, input: PositionInput!): Position!
  
  # Performance Management
  createPerformanceReview(employeeId: ID!, reviewType: ReviewType!, periodStartDate: DateTime!, periodEndDate: DateTime!): PerformanceReview!
  completePerformanceReview(id: ID!, overallRating: Float!, reviewerComments: String!): PerformanceReview!
  
  # Compliance
  generateComplianceReport(reportType: ComplianceReportType!, startDate: DateTime!, endDate: DateTime!): ComplianceReport!
  fileComplianceReport(id: ID!, confirmationNumber: String): ComplianceReport!
}

extend type Subscription {
  # Real-time payroll updates
  timesheetUpdates(businessId: ID!): Timesheet!
  payrollUpdates(businessId: ID!): Payrun!
  employeeUpdates(businessId: ID!): Employee!
}
`