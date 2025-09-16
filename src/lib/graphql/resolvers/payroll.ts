/**
 * GraphQL Resolvers for Payroll Services
 * Comprehensive resolvers for employees, timesheets, pay periods, deductions, tax calculations, benefits, compliance
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'dummy-key'
)

interface GraphQLContext {
  businessId: string
  userId: string
  permissions: string[]
  isAuthenticated: boolean
}

export const payrollResolvers = {
  Query: {
    // Employee Queries
    employee: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.employees')
        .select('
          *,
          department:payroll.departments!employees_department_id_fkey (*),
          position:payroll.positions!employees_position_id_fkey (*),
          manager:payroll.employees!employees_manager_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch employee: ${error.message}')
      return data
    },

    employees: async (_: unknown, { departmentId, positionId, managerId, status, employmentType, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.employees')
        .select('
          *,
          department:payroll.departments!employees_department_id_fkey (*),
          position:payroll.positions!employees_position_id_fkey (*),
          manager:payroll.employees!employees_manager_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }
      if (positionId) {
        query = query.eq('position_id', positionId)
      }
      if (managerId) {
        query = query.eq('manager_id', managerId)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (employmentType) {
        query = query.eq('employment_type', employmentType)
      }

      // Apply additional filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN':
              query = query.gt(filter.field, filter.value)
              break
            case 'LESS_THAN':
              query = query.lt(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('last_name`)
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0 // Implement cursor-based pagination logic here
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch employees: ${error.message}')

      return {
        edges: data.map((employee: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: employee
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Timesheet Queries
    timesheet: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.timesheets')
        .select('
          *,
          employee:payroll.employees!timesheets_employee_id_fkey (*),
          pay_period:payroll.pay_periods!timesheets_pay_period_id_fkey (*),
          approved_by:payroll.employees!timesheets_approved_by_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch timesheet: ${error.message}')
      return data
    },

    timesheets: async (_: unknown, { employeeId, payPeriodId, status, startDate, endDate, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.timesheets')
        .select('
          *,
          employee:payroll.employees!timesheets_employee_id_fkey (*),
          pay_period:payroll.pay_periods!timesheets_pay_period_id_fkey (*),
          approved_by:payroll.employees!timesheets_approved_by_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }
      if (payPeriodId) {
        query = query.eq('pay_period_id', payPeriodId)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      // Apply additional filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN_OR_EQUAL':
              query = query.gte(filter.field, filter.value)
              break
            case 'LESS_THAN_OR_EQUAL':
              query = query.lte(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch timesheets: ${error.message}')

      return {
        edges: data.map((timesheet: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: timesheet
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Pay Period Queries
    payPeriod: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.pay_periods')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch pay period: ${error.message}')
      return data
    },

    payPeriods: async (_: unknown, { status, year, pagination, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.pay_periods')
        .select('*', { count: 'exact' })
        .eq('business_id', context.businessId)

      if (status) {
        query = query.eq('status', status)
      }
      if (year) {
        query = query.gte('start_date', '${year}-01-01')
        query = query.lte('end_date', '${year}-12-31')
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('start_date`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch pay periods: ${error.message}')

      return {
        edges: data.map((period: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: period
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Payroll Processing Queries
    payrun: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.payruns')
        .select('
          *,
          pay_period:payroll.pay_periods!payruns_pay_period_id_fkey (*),
          processed_by:payroll.employees!payruns_processed_by_fkey (*),
          approved_by:payroll.employees!payruns_approved_by_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch payrun: ${error.message}')
      return data
    },

    payruns: async (_: unknown, { payPeriodId, status, pagination, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.payruns')
        .select('
          *,
          pay_period:payroll.pay_periods!payruns_pay_period_id_fkey (*),
          processed_by:payroll.employees!payruns_processed_by_fkey (*),
          approved_by:payroll.employees!payruns_approved_by_fkey (*)
        ')
        .eq('business_id', context.businessId)

      if (payPeriodId) {
        query = query.eq('pay_period_id', payPeriodId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('run_date', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch payruns: ${error.message}')
      return data
    },

    // Pay Stub Queries
    paystub: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.paystubs')
        .select('
          *,
          employee:payroll.employees!paystubs_employee_id_fkey (*),
          payrun:payroll.payruns!paystubs_payrun_id_fkey (*),
          pay_period:payroll.pay_periods!paystubs_pay_period_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch paystub: ${error.message}')
      return data
    },

    paystubs: async (_: unknown, { employeeId, payPeriodId, payrunId, year, pagination, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.paystubs')
        .select('
          *,
          employee:payroll.employees!paystubs_employee_id_fkey (*),
          payrun:payroll.payruns!paystubs_payrun_id_fkey (*),
          pay_period:payroll.pay_periods!paystubs_pay_period_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }
      if (payPeriodId) {
        query = query.eq('pay_period_id', payPeriodId)
      }
      if (payrunId) {
        query = query.eq('payrun_id', payrunId)
      }
      if (year) {
        query = query.gte('pay_date', '${year}-01-01')
        query = query.lte('pay_date', '${year}-12-31')
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('pay_date`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch paystubs: ${error.message}')

      return {
        edges: data.map((paystub: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: paystub
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Benefit Queries
    benefitPlan: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.benefit_plans')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch benefit plan: ${error.message}')
      return data
    },

    benefitPlans: async (_: unknown, { planType, planYear, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.benefit_plans')
        .select('*')
        .eq('business_id', context.businessId)

      if (planType) {
        query = query.eq('plan_type', planType)
      }
      if (planYear) {
        query = query.eq('plan_year', planYear)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.eq('is_active', true)
      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch benefit plans: ${error.message}')
      return data
    },

    // Payroll Deduction Queries
    payrollDeduction: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.payroll_deductions')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch payroll deduction: ${error.message}')
      return data
    },

    payrollDeductions: async (_: unknown, { category, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.payroll_deductions')
        .select('*')
        .eq('business_id', context.businessId)

      if (category) {
        query = query.eq('category', category)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.eq('is_active', true)
      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch payroll deductions: ${error.message}')
      return data
    },

    // Department Queries
    department: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.departments')
        .select('
          *,
          parent_department:payroll.departments!departments_parent_department_id_fkey (*),
          manager:payroll.employees!departments_manager_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch department: ${error.message}')
      return data
    },

    departments: async (_: unknown, { parentDepartmentId, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.departments')
        .select('
          *,
          parent_department:payroll.departments!departments_parent_department_id_fkey (*),
          manager:payroll.employees!departments_manager_id_fkey (*)
        ')
        .eq('business_id', context.businessId)

      if (parentDepartmentId) {
        query = query.eq('parent_department_id', parentDepartmentId)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.eq('is_active', true)
      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch departments: ${error.message}')
      return data
    },

    // Position Queries
    position: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.positions')
        .select('
          *,
          department:payroll.departments!positions_department_id_fkey (*),
          pay_grade:payroll.pay_grades!positions_pay_grade_id_fkey (*),
          reports_to_position:payroll.positions!positions_reports_to_position_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch position: ${error.message}')
      return data
    },

    positions: async (_: unknown, { departmentId, payGradeId, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.positions')
        .select('
          *,
          department:payroll.departments!positions_department_id_fkey (*),
          pay_grade:payroll.pay_grades!positions_pay_grade_id_fkey (*),
          reports_to_position:payroll.positions!positions_reports_to_position_id_fkey (*)
        ')
        .eq('business_id', context.businessId)

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }
      if (payGradeId) {
        query = query.eq('pay_grade_id', payGradeId)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.eq('is_active', true)
      query = query.order('title')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch positions: ${error.message}')
      return data
    },

    // Tax Rate Queries
    taxRates: async (_: unknown, { taxType, jurisdiction, taxYear, pagination }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.tax_rates')
        .select('*')
        .eq('business_id', context.businessId)

      if (taxType) {
        query = query.eq('tax_type', taxType)
      }
      if (jurisdiction) {
        query = query.eq('jurisdiction', jurisdiction)
      }
      if (taxYear) {
        query = query.eq('tax_year', taxYear)
      }

      query = query.eq('is_active', true)
      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch tax rates: ${error.message}')
      return data
    },

    // Compliance Report Queries
    complianceReports: async (_: unknown, { reportType, year, quarter, status, pagination }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('payroll.compliance_reports')
        .select('*')
        .eq('business_id', context.businessId)

      if (reportType) {
        query = query.eq('report_type', reportType)
      }
      if (year) {
        query = query.eq('year', year)
      }
      if (quarter) {
        query = query.eq('quarter', quarter)
      }
      if (status) {
        query = query.eq('status', status)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch compliance reports: ${error.message}')
      return data
    }
  },

  Mutation: {
    // Employee Management
    createEmployee: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const employeeId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.employees')
        .insert([{
          id: employeeId,
          business_id: context.businessId,
          first_name: input.firstName,
          last_name: input.lastName,
          middle_name: input.middleName,
          email: input.email,
          phone: input.phone,
          date_of_birth: input.dateOfBirth,
          social_security_number: input.socialSecurityNumber, // Should be encrypted
          address: input.address,
          emergency_contact: input.emergencyContact,
          employee_id: input.employeeId,
          department_id: input.departmentId,
          position_id: input.positionId,
          manager_id: input.managerId,
          status: 'ACTIVE',
          employment_type: input.employmentType,
          hire_date: input.hireDate,
          pay_type: input.payType,
          pay_rate: input.payRate,
          currency: input.currency || 'USD',
          pay_schedule: input.paySchedule,
          salary_basis: input.salaryBasis,
          annual_salary: input.annualSalary,
          hourly_rate: input.hourlyRate,
          work_location: input.workLocation,
          timezone: input.timezone,
          default_hours_per_day: input.defaultHoursPerDay,
          default_hours_per_week: input.defaultHoursPerWeek,
          is_exempt: input.isExempt,
          tax_information: input.taxInformation,
          w4_information: input.w4Information,
          work_eligibility: input.workEligibility,
          is_active: true,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create employee: ${error.message}')
      return data
    },

    updateEmployee: async (_: unknown, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.employees')
        .update({
          first_name: input.firstName,
          last_name: input.lastName,
          middle_name: input.middleName,
          email: input.email,
          phone: input.phone,
          date_of_birth: input.dateOfBirth,
          address: input.address,
          emergency_contact: input.emergencyContact,
          department_id: input.departmentId,
          position_id: input.positionId,
          manager_id: input.managerId,
          employment_type: input.employmentType,
          pay_type: input.payType,
          pay_rate: input.payRate,
          currency: input.currency,
          pay_schedule: input.paySchedule,
          salary_basis: input.salaryBasis,
          annual_salary: input.annualSalary,
          hourly_rate: input.hourlyRate,
          work_location: input.workLocation,
          timezone: input.timezone,
          default_hours_per_day: input.defaultHoursPerDay,
          default_hours_per_week: input.defaultHoursPerWeek,
          is_exempt: input.isExempt,
          tax_information: input.taxInformation,
          w4_information: input.w4Information,
          work_eligibility: input.workEligibility,
          custom_fields: input.customFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to update employee: ${error.message}')
      return data
    },

    terminateEmployee: async (_: unknown, { id, terminationDate, reason }: { id: string, terminationDate: string, reason?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.employees')
        .update({
          status: 'TERMINATED',
          termination_date: terminationDate,
          termination_reason: reason,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to terminate employee: ${error.message}')
      return data
    },

    // Timesheet Management
    createTimesheet: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const timesheetId = crypto.randomUUID()

      // Calculate totals from time entries
      const timeEntries = input.timeEntries || []
      const totalHours = timeEntries.reduce((sum: number, entry: unknown) => sum + entry.hoursWorked, 0)
      const regularHours = timeEntries.filter((e: unknown) => e.timeType === 'REGULAR').reduce((sum: number, entry: unknown) => sum + entry.hoursWorked, 0)
      const overtimeHours = timeEntries.filter((e: unknown) => e.timeType === 'OVERTIME').reduce((sum: number, entry: unknown) => sum + entry.hoursWorked, 0)

      const { data, error } = await supabase
        .from('payroll.timesheets')
        .insert([{
          id: timesheetId,
          business_id: context.businessId,
          employee_id: input.employeeId,
          pay_period_id: input.payPeriodId,
          status: 'DRAFT',
          time_entries: timeEntries,
          total_hours: totalHours,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          double_time_hours: 0,
          pto_hours: 0,
          sick_hours: 0,
          holiday_hours: 0,
          is_locked: false,
          notes: input.notes,
          custom_fields: Record<string, unknown>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create timesheet: ${error.message}')
      return data
    },

    submitTimesheet: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.timesheets')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to submit timesheet: ${error.message}')
      return data
    },

    approveTimesheet: async (_: unknown, { id, comments }: { id: string, comments?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.timesheets')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: context.userId,
          approval_comments: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to approve timesheet: ${error.message}')
      return data
    },

    rejectTimesheet: async (_: unknown, { id, reason }: { id: string, reason: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.timesheets')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to reject timesheet: ${error.message}')
      return data
    },

    // Pay Period Management
    createPayPeriod: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const payPeriodId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.pay_periods')
        .insert([{
          id: payPeriodId,
          business_id: context.businessId,
          name: input.name,
          start_date: input.startDate,
          end_date: input.endDate,
          pay_date: input.payDate,
          cutoff_date: input.cutoffDate,
          status: 'DRAFT',
          employee_count: 0,
          total_hours: 0,
          total_earnings: 0,
          total_deductions: 0,
          total_taxes: 0,
          net_pay: 0,
          is_processed: false,
          is_locked: false,
          notes: input.notes,
          custom_fields: Record<string, unknown>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create pay period: ${error.message}')
      return data
    },

    closePayPeriod: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('payroll.pay_periods')
        .update({
          status: 'CLOSED',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to close pay period: ${error.message}')
      return data
    },

    // Payroll Processing
    createPayrun: async (_: unknown, { payPeriodId }: { payPeriodId: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const payrunId = crypto.randomUUID()

      // Get pay period details
      const { data: payPeriod, error: payPeriodError } = await supabase
        .from('payroll.pay_periods')
        .select('*')
        .eq('id', payPeriodId)
        .eq('business_id', context.businessId)
        .single()

      if (payPeriodError) throw new Error('Pay period not found: ${payPeriodError.message}')

      const { data, error } = await supabase
        .from('payroll.payruns')
        .insert([{
          id: payrunId,
          business_id: context.businessId,
          name: 'Payroll Run - ${payPeriod.name}',
          pay_period_id: payPeriodId,
          run_date: new Date().toISOString(),
          pay_date: payPeriod.pay_date,
          status: 'DRAFT',
          employee_count: 0,
          total_gross_earnings: 0,
          total_deductions: 0,
          total_taxes: 0,
          total_net_pay: 0,
          bank_file_generated: false,
          is_test: false,
          errors: [],
          warnings: [],
          custom_fields: Record<string, unknown>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create payrun: ${error.message}')
      return data
    },

    processPayroll: async (_: unknown, { payrunId }: { payrunId: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // This would contain complex payroll calculation logic
      // For now, we'll just update the status'
      const { data, error } = await supabase
        .from('payroll.payruns')
        .update({
          status: 'PROCESSING',
          processed_at: new Date().toISOString(),
          processed_by: context.userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', payrunId)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to process payroll: ${error.message}')

      // Here you would implement the actual payroll calculations
      // Calculate earnings, deductions, taxes for each employee
      // Generate paystubs
      // etc.

      return data
    },

    // Department Management
    createDepartment: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const departmentId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.departments')
        .insert([{
          id: departmentId,
          business_id: context.businessId,
          name: input.name,
          code: input.code,
          description: input.description,
          parent_department_id: input.parentDepartmentId,
          manager_id: input.managerId,
          budget_amount: input.budgetAmount,
          actual_spent: 0,
          gl_account: input.glAccount,
          cost_center: input.costCenter,
          is_active: true,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create department: ${error.message}')
      return data
    },

    // Position Management
    createPosition: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const positionId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.positions')
        .insert([{
          id: positionId,
          business_id: context.businessId,
          title: input.title,
          code: input.code,
          description: input.description,
          department_id: input.departmentId,
          pay_grade_id: input.payGradeId,
          min_salary: input.minSalary,
          max_salary: input.maxSalary,
          target_salary: input.targetSalary,
          is_exempt: input.isExempt,
          job_level: input.jobLevel,
          reports_to_position_id: input.reportsToPositionId,
          required_skills: input.requiredSkills || [],
          preferred_skills: input.preferredSkills || [],
          education: input.education,
          experience: input.experience,
          current_employee_count: 0,
          max_employees: input.maxEmployees,
          is_active: true,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create position: ${error.message}')
      return data
    },

    // Benefits Management
    createBenefitPlan: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const benefitPlanId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.benefit_plans')
        .insert([{
          id: benefitPlanId,
          business_id: context.businessId,
          name: input.name,
          plan_type: input.planType,
          carrier: input.carrier,
          policy_number: input.policyNumber,
          plan_year: input.planYear,
          effective_date: input.effectiveDate,
          termination_date: input.terminationDate,
          enrollment_period_start: input.enrollmentPeriodStart,
          enrollment_period_end: input.enrollmentPeriodEnd,
          is_active: true,
          description: input.description,
          documents: [],
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create benefit plan: ${error.message}')
      return data
    },

    // Payroll Deduction Management
    createPayrollDeduction: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const deductionId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('payroll.payroll_deductions`)
        .insert([{
          id: deductionId,
          business_id: context.businessId,
          name: input.name,
          code: input.code,
          description: input.description,
          category: input.category,
          calculation_type: input.calculationType,
          amount: input.amount,
          percentage: input.percentage,
          limit: input.limit,
          annual_limit: input.annualLimit,
          employee_contribution: input.employeeContribution,
          employer_contribution: input.employerContribution,
          employer_match: input.employerMatch,
          match_percentage: input.matchPercentage,
          match_limit: input.matchLimit,
          pre_tax: input.preTax,
          frequency: input.frequency,
          start_date: input.startDate,
          end_date: input.endDate,
          is_active: true,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create payroll deduction: ${error.message}')
      return data
    }
  },

  // Field Resolvers
  Employee: {
    fullName: (parent: unknown) => {
      return '${parent.first_name} ${parent.last_name}'
    },

    department: async (parent: unknown) => {
      if (!parent.department_id) return null

      const { data, error } = await supabase
        .from('payroll.departments')
        .select('*')
        .eq('id', parent.department_id)
        .single()

      return error ? null : data
    },

    position: async (parent: unknown) => {
      if (!parent.position_id) return null

      const { data, error } = await supabase
        .from('payroll.positions')
        .select('*')
        .eq('id', parent.position_id)
        .single()

      return error ? null : data
    },

    manager: async (parent: unknown) => {
      if (!parent.manager_id) return null

      const { data, error } = await supabase
        .from('payroll.employees')
        .select('*')
        .eq('id', parent.manager_id)
        .single()

      return error ? null : data
    },

    timesheets: async (parent: unknown, { payPeriodId, status, pagination, filters, sorts }: any) => {
      let query = supabase
        .from('payroll.timesheets')
        .select('*', { count: 'exact' })
        .eq('employee_id', parent.id)

      if (payPeriodId) {
        query = query.eq('pay_period_id', payPeriodId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply filtering and sorting similar to main queries
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const limit = pagination?.first || 10
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((timesheet: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: timesheet
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    paystubs: async (parent: unknown, { payPeriodId, year, pagination, sorts }: any) => {
      let query = supabase
        .from('payroll.paystubs')
        .select('*', { count: 'exact' })
        .eq('employee_id', parent.id)

      if (payPeriodId) {
        query = query.eq('pay_period_id', payPeriodId)
      }
      if (year) {
        query = query.gte('pay_date', '${year}-01-01')
        query = query.lte('pay_date', '${year}-12-31')
      }

      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('pay_date', { ascending: false })
      }

      const limit = pagination?.first || 10
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((paystub: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: paystub
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    directReports: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('payroll.employees')
        .select('*')
        .eq('manager_id', parent.id)
        .eq('status', 'ACTIVE')

      return error ? [] : data
    },

    totalTimeWorked: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('payroll.timesheets')
        .select('total_hours')
        .eq('employee_id', parent.id)
        .eq('status', 'APPROVED')

      if (error) return 0

      return data.reduce((sum, timesheet) => sum + (timesheet.total_hours || 0), 0)
    }
  },

  PayPeriod: {
    timesheets: async (parent: unknown, { employeeId, status, pagination }: any) => {
      let query = supabase
        .from('payroll.timesheets')
        .select('*', { count: 'exact' })
        .eq('pay_period_id', parent.id)

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((timesheet: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: timesheet
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    payruns: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('payroll.payruns')
        .select('*')
        .eq('pay_period_id', parent.id)
        .order('run_date', { ascending: false })

      return error ? [] : data
    }
  },

  Department: {
    parentDepartment: async (parent: unknown) => {
      if (!parent.parent_department_id) return null

      const { data, error } = await supabase
        .from('payroll.departments')
        .select('*')
        .eq('id', parent.parent_department_id)
        .single()

      return error ? null : data
    },

    subDepartments: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('payroll.departments')
        .select('*')
        .eq('parent_department_id', parent.id)
        .eq('is_active', true)
        .order('name')

      return error ? [] : data
    },

    manager: async (parent: unknown) => {
      if (!parent.manager_id) return null

      const { data, error } = await supabase
        .from('payroll.employees')
        .select('*')
        .eq('id', parent.manager_id)
        .single()

      return error ? null : data
    },

    employees: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('payroll.employees')
        .select('*')
        .eq('department_id', parent.id)
        .eq('status', 'ACTIVE')
        .order('last_name')

      return error ? [] : data
    },

    employeeCount: async (parent: unknown) => {
      const { count, error } = await supabase
        .from('payroll.employees')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', parent.id)
        .eq('status', 'ACTIVE')

      return error ? 0 : count || 0
    }
  }
}

export default payrollResolvers