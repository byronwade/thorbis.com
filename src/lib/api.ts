import { Employee, PayrollRecord, Timesheet, BenefitsPlan, PayrollSchedule } from '@/types/payroll';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class PayrollAPI {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch('${API_BASE_URL}${endpoint}', {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error('API Error: ${response.status} ${response.statusText}');
    }

    return response.json();
  }

  // Employee Management
  static async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  static async getEmployee(id: string): Promise<Employee> {
    return this.request<Employee>('/employees/${id}');
  }

  static async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  static async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>('/employees/${id}', {
      method: 'PATCH',
      body: JSON.stringify(employee),
    });
  }

  static async deleteEmployee(id: string): Promise<void> {
    await this.request<void>('/employees/${id}', {
      method: 'DELETE',
    });
  }

  // Payroll Management
  static async getPayrollRecords(employeeId?: string): Promise<PayrollRecord[]> {
    const query = employeeId ? '?employeeId=${employeeId}' : ';
    return this.request<PayrollRecord[]>('/payroll${query}');
  }

  static async createPayrollRecord(record: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord> {
    return this.request<PayrollRecord>('/payroll', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  static async runPayroll(payPeriodStart: string, payPeriodEnd: string): Promise<PayrollRecord[]> {
    return this.request<PayrollRecord[]>('/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ payPeriodStart, payPeriodEnd }),
    });
  }

  // Time Management
  static async getTimesheets(employeeId?: string, date?: string): Promise<Timesheet[]> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (date) params.append('date', date);
    const query = params.toString() ? '?${params.toString()}' : ';
    return this.request<Timesheet[]>('/timesheets${query}');
  }

  static async createTimesheet(timesheet: Omit<Timesheet, 'id'>): Promise<Timesheet> {
    return this.request<Timesheet>('/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheet),
    });
  }

  static async updateTimesheet(id: string, timesheet: Partial<Timesheet>): Promise<Timesheet> {
    return this.request<Timesheet>('/timesheets/${id}', {
      method: 'PATCH',
      body: JSON.stringify(timesheet),
    });
  }

  static async approveTimesheet(id: string): Promise<Timesheet> {
    return this.request<Timesheet>('/timesheets/${id}/approve', {
      method: 'POST',
    });
  }

  // Benefits Management
  static async getBenefitsPlans(): Promise<BenefitsPlan[]> {
    return this.request<BenefitsPlan[]>('/benefits/plans');
  }

  static async enrollInBenefits(employeeId: string, planIds: string[]): Promise<void> {
    await this.request<void>('/benefits/enroll', {
      method: 'POST',
      body: JSON.stringify({ employeeId, planIds }),
    });
  }

  static async getEmployeeBenefits(employeeId: string): Promise<BenefitsPlan[]> {
    return this.request<BenefitsPlan[]>('/employees/${employeeId}/benefits');
  }

  // Payroll Schedules
  static async getPayrollSchedules(): Promise<PayrollSchedule[]> {
    return this.request<PayrollSchedule[]>('/payroll/schedules');
  }

  static async createPayrollSchedule(schedule: Omit<PayrollSchedule, 'id'>): Promise<PayrollSchedule> {
    return this.request<PayrollSchedule>('/payroll/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  static async updatePayrollSchedule(id: string, schedule: Partial<PayrollSchedule>): Promise<PayrollSchedule> {
    return this.request<PayrollSchedule>('/payroll/schedules/${id}', {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    });
  }
}