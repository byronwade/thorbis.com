import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Invalid phone number'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  salary: z.number().positive('Salary must be positive'),
  payType: z.enum(['salary', 'hourly']),
  status: z.enum(['active', 'inactive', 'terminated']),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  }),
  taxInfo: z.object({
    ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format'),
    filingStatus: z.enum(['single', 'married', 'head_of_household']),
    allowances: z.number().int().min(0),
  }),
});

export const timesheetSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.string().min(1, 'Date is required'),
  clockIn: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid clock in time'),
  clockOut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid clock out time').optional(),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break start time').optional(),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid break end time').optional(),
  totalHours: z.number().positive('Total hours must be positive').optional(),
  overtime: z.number().min(0, 'Overtime cannot be negative').optional(),
  approved: z.boolean().default(false),
  notes: z.string().optional(),
});

export const benefitsEnrollmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  coverage: z.enum(['employee', 'employee_spouse', 'employee_children', 'family']),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  deductionAmount: z.number().positive('Deduction amount must be positive'),
});

export const directDepositSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  accountType: z.enum(['checking', 'savings']),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  accountNumber: z.string().min(4, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  percentage: z.number().min(1).max(100, 'Percentage must be between 1 and 100'),
  isActive: z.boolean().default(true),
});

export const payrollScheduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Schedule name is required'),
  frequency: z.enum(['weekly', 'bi-weekly', 'semi-monthly', 'monthly']),
  payDays: z.array(z.number().min(0).max(6)).min(1, 'At least one pay day is required'),
  isActive: z.boolean().default(true),
  nextPayDate: z.string().min(1, 'Next pay date is required'),
});

export const payrollRecordSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  payPeriodStart: z.string().min(1, 'Pay period start is required'),
  payPeriodEnd: z.string().min(1, 'Pay period end is required'),
  regularHours: z.number().min(0, 'Regular hours cannot be negative'),
  overtimeHours: z.number().min(0, 'Overtime hours cannot be negative'),
  grossPay: z.number().positive('Gross pay must be positive'),
  federalTax: z.number().min(0, 'Federal tax cannot be negative'),
  stateTax: z.number().min(0, 'State tax cannot be negative'),
  socialSecurity: z.number().min(0, 'Social security cannot be negative'),
  medicare: z.number().min(0, 'Medicare cannot be negative'),
  benefits: z.number().min(0, 'Benefits cannot be negative'),
  netPay: z.number().positive('Net pay must be positive'),
  status: z.enum(['draft', 'approved', 'paid']),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type TimesheetFormData = z.infer<typeof timesheetSchema>;
export type BenefitsEnrollmentFormData = z.infer<typeof benefitsEnrollmentSchema>;
export type DirectDepositFormData = z.infer<typeof directDepositSchema>;
export type PayrollScheduleFormData = z.infer<typeof payrollScheduleSchema>;
export type PayrollRecordFormData = z.infer<typeof payrollRecordSchema>;