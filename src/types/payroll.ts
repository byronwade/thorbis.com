export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface TaxInfo {
  ssn: string;
  filingStatus: 'single' | 'married' | 'head_of_household';
  allowances: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  terminationDate?: string;
  salary: number;
  payType: 'salary' | 'hourly';
  status: 'active' | 'inactive' | 'terminated';
  address: Address;
  taxInfo: TaxInfo;
  managerId?: string;
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  directDeposit?: DirectDeposit[];
  benefits?: EmployeeBenefit[];
}

export interface DirectDeposit {
  id: string;
  employeeId: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
  accountNumber: string;
  bankName: string;
  percentage: number;
  isActive: boolean;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  benefits: number;
  otherDeductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  payDate?: string;
  checkNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  regularHours?: number;
  overtime?: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BenefitsPlan {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision' | 'retirement' | 'life' | 'disability';
  description: string;
  premium: number;
  employerContribution: number;
  deductible?: number;
  copay?: number;
  coverage: string[];
  provider: string;
  isActive: boolean;
  eligibilityRequirements: string[];
  enrollmentPeriod: {
    start: string;
    end: string;
  };
}

export interface EmployeeBenefit {
  id: string;
  employeeId: string;
  planId: string;
  coverage: 'employee' | 'employee_spouse' | 'employee_children' | 'family';
  effectiveDate: string;
  endDate?: string;
  deductionAmount: number;
  status: 'active' | 'terminated' | 'suspended';
  enrolledAt: string;
}

export interface PayrollSchedule {
  id: string;
  name: string;
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
  payDays: number[]; // 0-6, Sunday = 0
  isActive: boolean;
  nextPayDate: string;
  employees: string[]; // employee IDs
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'bereavement' | 'jury_duty';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  budget?: number;
  employees: string[];
  isActive: boolean;
}

export interface PayrollReport {
  id: string;
  title: string;
  type: 'payroll_summary' | 'tax_liability' | 'payroll_register' | 'deductions' | 'labor_costs';
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    employees?: string[];
    departments?: string[];
  };
  data: unknown;
  generatedAt: string;
  generatedBy: string;
}

export interface ComplianceRecord {
  id: string;
  type: 'workers_comp' | 'unemployment' | 'tax_filing' | 'rd_credit' | 'aca_reporting';
  status: 'compliant' | 'pending' | 'overdue' | 'filed';
  dueDate: string;
  filedDate?: string;
  amount?: number;
  description: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HRDocument {
  id: string;
  employeeId?: string;
  type: 'handbook' | 'policy' | 'form' | 'contract' | 'performance_review' | 'disciplinary' | 'other';
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  requiresSignature: boolean;
  signedAt?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: {
    start: string;
    end: string;
  };
  overallRating: 1 | 2 | 3 | 4 | 5;
  goals: {
    description: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comments?: string;
  }[];
  strengths: string;
  areasForImprovement: string;
  developmentPlan: string;
  salaryRecommendation?: number;
  status: 'draft' | 'completed' | 'acknowledged';
  dueDate: string;
  completedAt?: string;
  employeeComments?: string;
  createdAt: string;
  updatedAt: string;
}