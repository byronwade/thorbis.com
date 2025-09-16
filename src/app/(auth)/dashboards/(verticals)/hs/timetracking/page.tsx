'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Clock,
  Play,
  Pause,
  Square,
  Timer,
  Calendar,
  User,
  MapPin,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Wrench,
  FileText,
  Phone,
  Building,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Info,
  History,
  Navigation,
  Camera,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface TimeEntry {
  id: string
  employeeId: string
  employeeName: string
  job: {
    id: string
    workOrderNumber: string
    customer: string
    address: string
    service: string
  }
  task: {
    id: string
    name: string
    category: 'setup' | 'diagnosis' | 'repair' | 'maintenance' | 'cleanup' | 'travel' | 'break'
    description?: string
  }
  timeLog: {
    clockIn: string
    clockOut?: string
    totalMinutes: number
    breakMinutes: number
    travelMinutes: number
    billableMinutes: number
  }
  location: {
    clockInLocation?: {
      lat: number
      lng: number
      address: string
      accuracy: number
    }
    clockOutLocation?: {
      lat: number
      lng: number
      address: string
      accuracy: number
    }
    onSiteVerification: boolean
  }
  payroll: {
    hourlyRate: number
    overtimeRate: number
    regularPay: number
    overtimePay: number
    totalPay: number
    payPeriod: string
  }
  billing: {
    billableRate: number
    billableAmount: number
    nonBillableMinutes: number
    markupPercentage: number
    customerCharge: number
  }
  status: 'in_progress' | 'completed' | 'break' | 'travel' | 'pending_approval' | 'approved' | 'rejected'
  metadata: {
    device: string
    ipAddress: string
    gpsAccuracy?: number
    batteryLevel?: number
    connectivity: 'online' | 'offline'
    syncStatus: 'synced' | 'pending' | 'failed'
  }
  notes: string[]
  photos: Array<{
    id: string
    url: string
    timestamp: string
    location?: { lat: number;
import { Button } from '@/components/ui/button';
 lng: number }
  }>
  approvals: {
    supervisorId?: string
    supervisorName?: string
    approvedAt?: string
    rejectionReason?: string
    modifications?: Array<{
      field: string
      originalValue: any
      newValue: any
      reason: string
    }>
  }
  createdAt: string
  updatedAt: string
}

interface TimeSheet {
  id: string
  employeeId: string
  employeeName: string
  payPeriod: {
    start: string
    end: string
    weekNumber: number
  }
  summary: {
    totalHours: number
    regularHours: number
    overtimeHours: number
    breakHours: number
    travelHours: number
    billableHours: number
  }
  payroll: {
    regularPay: number
    overtimePay: number
    bonusPay: number
    totalPay: number
    deductions: number
    netPay: number
  }
  billing: {
    billableAmount: number
    nonBillableAmount: number
    totalCustomerCharge: number
    profitMargin: number
  }
  entries: string[] // TimeEntry IDs
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed'
  approvals: {
    employeeSignedAt?: string
    supervisorId?: string
    supervisorApprovedAt?: string
    payrollProcessedAt?: string
  }
  createdAt: string
  updatedAt: string
}

interface LaborAnalytics {
  overview: {
    totalHours: number
    billableHours: number
    utilizationRate: number
    averageHourlyRate: number
    totalLaborCost: number
    totalRevenue: number
    profitMargin: number
  }
  trends: {
    daily: Array<{
      date: string
      hours: number
      revenue: number
      utilization: number
    }>
    weekly: Array<{
      week: string
      hours: number
      revenue: number
      efficiency: number
    }>
    monthly: Array<{
      month: string
      hours: number
      cost: number
      revenue: number
      profit: number
    }>
  }
  breakdown: {
    byEmployee: Array<{
      employeeId: string
      name: string
      totalHours: number
      billableHours: number
      hourlyRate: number
      totalPay: number
      efficiency: number
      utilization: number
    }>
    byProject: Array<{
      jobId: string
      workOrder: string
      customer: string
      totalHours: number
      laborCost: number
      billableAmount: number
      profitMargin: number
    }>
    byTask: Array<{
      category: string
      totalHours: number
      billableHours: number
      averageTime: number
      efficiency: number
    }>
  }
}

export default function TimeTrackingPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'entries' | 'timesheets' | 'analytics' | 'approvals' | 'settings'>('live')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [timesheets, setTimesheets] = useState<TimeSheet[]>([])
  const [analytics, setAnalytics] = useState<LaborAnalytics | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeEntries, setActiveEntries] = useState<TimeEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [filters, setFilters] = useState({
    employee: 'all',
    status: 'all',
    dateRange: '7d',
    job: 'all'
  })
  const [searchTerm, setSearchTerm] = useState(')

  useEffect(() => {
    fetchTimeTrackingData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchTimeTrackingData = async () => {
    try {
      // Generate comprehensive time tracking data
      const employees = [
        'Mike Rodriguez', 'Sarah Johnson', 'David Chen', 'Amy Williams', 
        'Tom Wilson', 'Lisa Brown', 'James Davis', 'Maria Garcia'
      ]
      
      const mockTimeEntries: TimeEntry[] = Array.from({ length: 120 }, (_, i) => {
        const employee = employees[Math.floor(Math.random() * employees.length)]
        const clockInTime = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
        const workDuration = Math.floor(Math.random() * 8 * 60) + 60 // 1-9 hours in minutes
        const breakMinutes = Math.floor(Math.random() * 60) + 30
        const travelMinutes = Math.floor(Math.random() * 90) + 15
        const billableMinutes = workDuration - breakMinutes
        const hourlyRate = Math.floor(Math.random() * 30) + 25 // $25-55/hr
        const billableRate = Math.floor(hourlyRate * 1.5) // 1.5x markup for billing
        const isCompleted = Math.random() < 0.8
        const isActive = !isCompleted && Math.random() < 0.1
        
        return {
          id: 'entry-${String(i + 1).padStart(3, '0')}',
          employeeId: 'emp-${String(employees.indexOf(employee) + 1).padStart(3, '0')}',
          employeeName: employee,
          job: {
            id: 'job-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}',
            workOrderNumber: 'WO-2024-${String(Math.floor(Math.random() * 1000) + 1000).padStart(4, '0')}',
            customer: ['Jennifer Martinez', 'Robert Wilson', 'Sarah Thompson', 'Michael Davis'][Math.floor(Math.random() * 4)],
            address: '${Math.floor(Math.random() * 9999) + 1} Oak Street, Springfield, IL',
            service: ['HVAC Repair', 'Plumbing Service', 'Electrical Work', 'Appliance Repair'][Math.floor(Math.random() * 4)]
          },
          task: {
            id: 'task-${String(i + 1).padStart(3, '0')}',
            name: ['Equipment Diagnosis', 'System Repair', 'Preventive Maintenance', 'Emergency Service'][Math.floor(Math.random() * 4)],
            category: ['diagnosis', 'repair', 'maintenance', 'setup', 'cleanup'][Math.floor(Math.random() * 5)] as any,
            description: 'Professional service task completion`
          },
          timeLog: {
            clockIn: clockInTime.toISOString(),
            clockOut: isCompleted ? new Date(clockInTime.getTime() + workDuration * 60 * 1000).toISOString() : undefined,
            totalMinutes: isCompleted ? workDuration : Math.floor((Date.now() - clockInTime.getTime()) / 60000),
            breakMinutes: isCompleted ? breakMinutes : Math.floor(breakMinutes * (Math.random() * 0.5 + 0.5)),
            travelMinutes,
            billableMinutes: isCompleted ? billableMinutes : Math.floor(billableMinutes * (Math.random() * 0.8 + 0.6))
          },
          location: {
            clockInLocation: {
              lat: 39.7817 + (Math.random() - 0.5) * 0.1,
              lng: -89.6501 + (Math.random() - 0.5) * 0.1,
              address: `${Math.floor(Math.random() * 9999) + 1} Work Location, Springfield, IL',
              accuracy: Math.floor(Math.random() * 20) + 5
            },
            clockOutLocation: isCompleted ? {
              lat: 39.7817 + (Math.random() - 0.5) * 0.1,
              lng: -89.6501 + (Math.random() - 0.5) * 0.1,
              address: '${Math.floor(Math.random() * 9999) + 1} Work Location, Springfield, IL',
              accuracy: Math.floor(Math.random() * 20) + 5
            } : undefined,
            onSiteVerification: Math.random() < 0.9
          },
          payroll: {
            hourlyRate,
            overtimeRate: hourlyRate * 1.5,
            regularPay: Math.floor((Math.min(workDuration, 480) / 60) * hourlyRate * 100) / 100,
            overtimePay: workDuration > 480 ? Math.floor(((workDuration - 480) / 60) * hourlyRate * 1.5 * 100) / 100 : 0,
            totalPay: 0,
            payPeriod: '2024-W34'
          },
          billing: {
            billableRate,
            billableAmount: Math.floor((billableMinutes / 60) * billableRate * 100) / 100,
            nonBillableMinutes: workDuration - billableMinutes,
            markupPercentage: 50,
            customerCharge: Math.floor((billableMinutes / 60) * billableRate * 1.2 * 100) / 100
          },
          status: isActive ? 'in_progress' : 
                   Math.random() < 0.1 ? 'break' :
                   Math.random() < 0.05 ? 'travel' :
                   isCompleted ? (Math.random() < 0.9 ? 'approved' : 'pending_approval') : 'completed',
          metadata: {
            device: ['iPhone 15', 'Samsung Galaxy S24', 'iPad Pro', 'Android Tablet'][Math.floor(Math.random() * 4)],
            ipAddress: '192.168.1.${Math.floor(Math.random() * 254) + 1}',
            gpsAccuracy: Math.floor(Math.random() * 20) + 5,
            batteryLevel: Math.floor(Math.random() * 100) + 1,
            connectivity: Math.random() < 0.95 ? 'online' : 'offline',
            syncStatus: Math.random() < 0.95 ? 'synced' : Math.random() < 0.8 ? 'pending' : 'failed'
          },
          notes: Math.random() < 0.3 ? ['Additional work required due to complexity', 'Customer requested extra services`] : [],
          photos: Math.random() < 0.4 ? [
            {
              id: `photo-${i}-1',
              url: '/photos/work_${i + 1}.jpg',
              timestamp: new Date(clockInTime.getTime() + Math.random() * workDuration * 60 * 1000).toISOString(),
              location: { lat: 39.7817, lng: -89.6501 }
            }
          ] : [],
          approvals: isCompleted ? {
            supervisorId: Math.random() < 0.8 ? 'sup-001' : undefined,
            supervisorName: Math.random() < 0.8 ? 'John Manager' : undefined,
            approvedAt: Math.random() < 0.8 ? new Date(clockInTime.getTime() + workDuration * 60 * 1000 + 3600000).toISOString() : undefined,
            rejectionReason: Math.random() < 0.1 ? 'Time discrepancy needs clarification' : undefined
          } : Record<string, unknown>,
          createdAt: clockInTime.toISOString(),
          updatedAt: new Date(clockInTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      // Calculate total pay for each entry
      mockTimeEntries.forEach(entry => {
        entry.payroll.totalPay = entry.payroll.regularPay + entry.payroll.overtimePay
      })

      const mockTimesheets: TimeSheet[] = Array.from({ length: 16 }, (_, i) => {
        const employee = employees[i % employees.length]
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        const employeeEntries = mockTimeEntries.filter(e => 
          e.employeeName === employee && 
          new Date(e.createdAt) >= weekStart && 
          new Date(e.createdAt) <= weekEnd
        )
        
        const totalMinutes = employeeEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0)
        const totalHours = totalMinutes / 60
        const regularHours = Math.min(totalHours, 40)
        const overtimeHours = Math.max(totalHours - 40, 0)
        const breakHours = employeeEntries.reduce((sum, e) => sum + e.timeLog.breakMinutes, 0) / 60
        const billableHours = employeeEntries.reduce((sum, e) => sum + e.timeLog.billableMinutes, 0) / 60
        
        const avgHourlyRate = employeeEntries.length > 0 ? 
          employeeEntries.reduce((sum, e) => sum + e.payroll.hourlyRate, 0) / employeeEntries.length : 30
        
        const regularPay = regularHours * avgHourlyRate
        const overtimePay = overtimeHours * avgHourlyRate * 1.5
        const totalPay = regularPay + overtimePay
        
        return {
          id: 'timesheet-${String(i + 1).padStart(3, '0')}',
          employeeId: 'emp-${String(employees.indexOf(employee) + 1).padStart(3, '0')}',
          employeeName: employee,
          payPeriod: {
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0],
            weekNumber: Math.floor((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
          },
          summary: {
            totalHours,
            regularHours,
            overtimeHours,
            breakHours,
            travelHours: employeeEntries.reduce((sum, e) => sum + e.timeLog.travelMinutes, 0) / 60,
            billableHours
          },
          payroll: {
            regularPay,
            overtimePay,
            bonusPay: Math.random() < 0.2 ? Math.floor(Math.random() * 200) + 50 : 0,
            totalPay,
            deductions: totalPay * 0.25, // 25% for taxes/benefits
            netPay: totalPay * 0.75
          },
          billing: {
            billableAmount: employeeEntries.reduce((sum, e) => sum + e.billing.billableAmount, 0),
            nonBillableAmount: employeeEntries.reduce((sum, e) => sum + ((e.timeLog.totalMinutes - e.timeLog.billableMinutes) || 0) / 60 * e.billing.billableRate, 0),
            totalCustomerCharge: employeeEntries.reduce((sum, e) => sum + e.billing.customerCharge, 0),
            profitMargin: 0
          },
          entries: employeeEntries.map(e => e.id),
          status: Math.random() < 0.7 ? 'approved' : Math.random() < 0.8 ? 'submitted' : 'draft',
          approvals: {
            employeeSignedAt: Math.random() < 0.9 ? weekEnd.toISOString() : undefined,
            supervisorId: Math.random() < 0.8 ? 'sup-001' : undefined,
            supervisorApprovedAt: Math.random() < 0.7 ? new Date(weekEnd.getTime() + 86400000).toISOString() : undefined,
            payrollProcessedAt: Math.random() < 0.6 ? new Date(weekEnd.getTime() + 172800000).toISOString() : undefined
          },
          createdAt: weekStart.toISOString(),
          updatedAt: weekEnd.toISOString()
        }
      })

      // Calculate profit margins
      mockTimesheets.forEach(sheet => {
        sheet.billing.profitMargin = sheet.billing.totalCustomerCharge > 0 ?
          ((sheet.billing.totalCustomerCharge - sheet.payroll.totalPay) / sheet.billing.totalCustomerCharge) * 100 : 0
      })

      const mockAnalytics: LaborAnalytics = {
        overview: {
          totalHours: mockTimeEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0) / 60,
          billableHours: mockTimeEntries.reduce((sum, e) => sum + e.timeLog.billableMinutes, 0) / 60,
          utilizationRate: 0,
          averageHourlyRate: mockTimeEntries.reduce((sum, e) => sum + e.payroll.hourlyRate, 0) / mockTimeEntries.length,
          totalLaborCost: mockTimeEntries.reduce((sum, e) => sum + e.payroll.totalPay, 0),
          totalRevenue: mockTimeEntries.reduce((sum, e) => sum + e.billing.customerCharge, 0),
          profitMargin: 0
        },
        trends: {
          daily: Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dayEntries = mockTimeEntries.filter(e => 
              new Date(e.createdAt).toDateString() === date.toDateString()
            )
            return {
              date: date.toISOString().split('T')[0],
              hours: dayEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0) / 60,
              revenue: dayEntries.reduce((sum, e) => sum + e.billing.customerCharge, 0),
              utilization: dayEntries.length > 0 ? 
                (dayEntries.reduce((sum, e) => sum + e.timeLog.billableMinutes, 0) / 
                 dayEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0)) * 100 : 0
            }
          }).reverse(),
          weekly: Array.from({ length: 4 }, (_, i) => ({
            week: 'Week ${i + 1}',
            hours: Math.floor(Math.random() * 200) + 150,
            revenue: Math.floor(Math.random() * 15000) + 8000,
            efficiency: Math.floor(Math.random() * 20) + 75
          })),
          monthly: Array.from({ length: 6 }, (_, i) => {
            const month = new Date()
            month.setMonth(month.getMonth() - i)
            return {
              month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              hours: Math.floor(Math.random() * 800) + 600,
              cost: Math.floor(Math.random() * 25000) + 15000,
              revenue: Math.floor(Math.random() * 40000) + 25000,
              profit: Math.floor(Math.random() * 15000) + 8000
            }
          }).reverse()
        },
        breakdown: {
          byEmployee: employees.map(emp => {
            const empEntries = mockTimeEntries.filter(e => e.employeeName === emp)
            return {
              employeeId: 'emp-${String(employees.indexOf(emp) + 1).padStart(3, '0')}',
              name: emp,
              totalHours: empEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0) / 60,
              billableHours: empEntries.reduce((sum, e) => sum + e.timeLog.billableMinutes, 0) / 60,
              hourlyRate: empEntries.length > 0 ? empEntries.reduce((sum, e) => sum + e.payroll.hourlyRate, 0) / empEntries.length : 0,
              totalPay: empEntries.reduce((sum, e) => sum + e.payroll.totalPay, 0),
              efficiency: empEntries.length > 0 ? Math.random() * 20 + 80 : 0,
              utilization: empEntries.length > 0 ? 
                (empEntries.reduce((sum, e) => sum + e.timeLog.billableMinutes, 0) / 
                 empEntries.reduce((sum, e) => sum + e.timeLog.totalMinutes, 0)) * 100 : 0
            }
          }),
          byProject: Array.from({ length: 8 }, (_, i) => ({
            jobId: 'job-${String(i + 1).padStart(3, '0')}',
            workOrder: 'WO-2024-${String(i + 1000).padStart(4, '0')}',
            customer: ['Jennifer Martinez', 'Robert Wilson', 'Sarah Thompson', 'Michael Davis'][i % 4],
            totalHours: Math.floor(Math.random() * 20) + 5,
            laborCost: Math.floor(Math.random() * 1500) + 500,
            billableAmount: Math.floor(Math.random() * 2000) + 800,
            profitMargin: Math.floor(Math.random() * 40) + 20
          })),
          byTask: ['diagnosis', 'repair', 'maintenance', 'setup', 'cleanup'].map(category => ({
            category,
            totalHours: Math.floor(Math.random() * 100) + 50,
            billableHours: Math.floor(Math.random() * 80) + 40,
            averageTime: Math.floor(Math.random() * 60) + 30,
            efficiency: Math.floor(Math.random() * 20) + 75
          }))
        }
      }

      // Calculate derived metrics
      mockAnalytics.overview.utilizationRate = mockAnalytics.overview.totalHours > 0 ?
        (mockAnalytics.overview.billableHours / mockAnalytics.overview.totalHours) * 100 : 0
      mockAnalytics.overview.profitMargin = mockAnalytics.overview.totalRevenue > 0 ?
        ((mockAnalytics.overview.totalRevenue - mockAnalytics.overview.totalLaborCost) / mockAnalytics.overview.totalRevenue) * 100 : 0

      // Set active entries (currently in progress)
      const mockActiveEntries = mockTimeEntries.filter(entry => entry.status === 'in_progress')

      setTimeEntries(mockTimeEntries)
      setTimesheets(mockTimesheets)
      setAnalytics(mockAnalytics)
      setActiveEntries(mockActiveEntries)
    } catch (error) {
      console.error('Error fetching time tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.job.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.job.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmployee = filters.employee === 'all' || entry.employeeName === filters.employee
    const matchesStatus = filters.status === 'all' || entry.status === filters.status
    const matchesJob = filters.job === 'all' || entry.job.workOrderNumber === filters.job

    return matchesSearch && matchesEmployee && matchesStatus && matchesJob
  })

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return '${hours}h ${mins}m'
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const timeEntryColumns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (row: unknown) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
            {row.employeeName.split(' ').map((n: string) => n[0]).join(')}
          </div>
          <span className="text-white">{row.employeeName}</span>
        </div>
      )
    },
    {
      key: 'job.workOrderNumber',
      label: 'Job',
      render: (row: unknown) => (
        <div>
          <div className="font-mono text-sm text-blue-400">{row.job.workOrderNumber}</div>
          <div className="text-xs text-neutral-400">{row.job.customer}</div>
        </div>
      )
    },
    {
      key: 'task.name',
      label: 'Task',
      render: (row: unknown) => (
        <div>
          <div className="text-white">{row.task.name}</div>
          <div className={'text-xs px-2 py-1 rounded-full inline-block ${
            row.task.category === 'repair' ? 'bg-red-800 text-red-200' :
            row.task.category === 'maintenance' ? 'bg-green-800 text-green-200' :
            row.task.category === 'diagnosis' ? 'bg-blue-800 text-blue-200' :
            'bg-neutral-800 text-neutral-200'
              }'}>'
            {row.task.category}
          </div>
        </div>
      )
    },
    {
      key: 'timeLog',
      label: 'Time',
      render: (row: unknown) => (
        <div>
          <div className="text-white font-medium">
            {formatTime(row.timeLog.totalMinutes)}
          </div>
          <div className="text-xs text-neutral-400">
            Billable: {formatTime(row.timeLog.billableMinutes)}
          </div>
        </div>
      )
    },
    {
      key: 'billing.customerCharge',
      label: 'Revenue',
      render: (row: unknown) => (
        <div>
          <div className="text-green-400 font-medium">
            {formatCurrency(row.billing.customerCharge)}
          </div>
          <div className="text-xs text-neutral-400">
            Cost: {formatCurrency(row.payroll.totalPay)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: unknown) => (
        <div className={'px-3 py-1 rounded-full text-sm font-medium ${
          row.status === 'approved' ? 'bg-green-800 text-green-200' :
          row.status === 'in_progress' ? 'bg-blue-800 text-blue-200' :
          row.status === 'pending_approval' ? 'bg-yellow-800 text-yellow-200' :
          row.status === 'rejected' ? 'bg-red-800 text-red-200' :
          row.status === 'break' ? 'bg-orange-800 text-orange-200' :
          'bg-neutral-800 text-neutral-200'
              }'}>'
          {row.status.replace('_', ' ').toUpperCase()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: unknown) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedEntry(row)}
            className="text-neutral-400 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const renderLiveTracking = () => (
    <div className="space-y-6">
      {/* Live Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <Play className="h-6 w-6" />
            </div>
            <div className="flex items-center text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
              Live
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{activeEntries.length}</h3>
            <p className="text-sm text-neutral-400">Active Sessions</p>
            <p className="text-xs text-neutral-500">Currently tracking</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">
              {formatTime(activeEntries.reduce((sum, entry) => sum + entry.timeLog.totalMinutes, 0))}
            </h3>
            <p className="text-sm text-neutral-400">Total Active Time</p>
            <p className="text-xs text-neutral-500">Today so far</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">
              {formatCurrency(activeEntries.reduce((sum, entry) => sum + entry.billing.customerCharge, 0))}
            </h3>
            <p className="text-sm text-neutral-400">Active Revenue</p>
            <p className="text-xs text-neutral-500">In progress</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">
              {activeEntries.length > 0 ? 
                Math.round((activeEntries.reduce((sum, entry) => sum + entry.timeLog.billableMinutes, 0) /
                           activeEntries.reduce((sum, entry) => sum + entry.timeLog.totalMinutes, 0)) * 100) : 0
              }%
            </h3>
            <p className="text-sm text-neutral-400">Utilization</p>
            <p className="text-xs text-neutral-500">Live average</p>
          </div>
        </div>
      </div>

      {/* Active Time Entries */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Active Time Tracking</h3>
          <div className="text-sm text-neutral-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        {activeEntries.length > 0 ? (
          <div className="space-y-4">
            {activeEntries.map((entry) => {
              const elapsedMinutes = Math.floor((currentTime.getTime() - new Date(entry.timeLog.clockIn).getTime()) / 60000)
              return (
                <div key={entry.id} className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-3">
                        {entry.employeeName.split(' ').map(n => n[0]).join(')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{entry.employeeName}</div>
                        <div className="text-sm text-neutral-400">{entry.job.customer}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white font-mono">
                        {formatTime(elapsedMinutes)}
                      </div>
                      <div className="text-sm text-neutral-400">
                        Started {new Date(entry.timeLog.clockIn).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-neutral-400">Job</div>
                      <div className="text-white font-mono text-sm">{entry.job.workOrderNumber}</div>
                      <div className="text-xs text-neutral-500">{entry.job.service}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Task</div>
                      <div className="text-white">{entry.task.name}</div>
                      <div className={'text-xs px-2 py-1 rounded-full inline-block ${
                        entry.task.category === 'repair' ? 'bg-red-800 text-red-200' :
                        entry.task.category === 'maintenance' ? 'bg-green-800 text-green-200' :
                        entry.task.category === 'diagnosis' ? 'bg-blue-800 text-blue-200' :
                        'bg-neutral-800 text-neutral-200`
              }'}>'
                        {entry.task.category}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Location</div>
                      <div className={'flex items-center text-sm ${
                        entry.location.onSiteVerification ? 'text-green-400' : 'text-yellow-400'
              }'}>'
                        <MapPin className="h-3 w-3 mr-1" />
                        {entry.location.onSiteVerification ? 'Verified' : 'Unverified'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        GPS: ±{entry.location.clockInLocation?.accuracy}m
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={'flex items-center text-xs ${
                        entry.metadata.connectivity === 'online' ? 'text-green-400' : 'text-red-400'
              }'}>'
                        {entry.metadata.connectivity === 'online' ? 
                          <Wifi className="h-3 w-3 mr-1" /> : 
                          <WifiOff className="h-3 w-3 mr-1" />
                        }
                        {entry.metadata.connectivity}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Battery: {entry.metadata.batteryLevel}%
                      </div>
                      <div className={'text-xs ${
                        entry.metadata.syncStatus === 'synced' ? 'text-green-400' : 
                        entry.metadata.syncStatus === 'pending' ? 'text-yellow-400' : 'text-red-400`
              }`}>'
                        {entry.metadata.syncStatus}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                        <Pause className="h-4 w-4 mr-1" />
                        Break
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>

                  {/* Real-time Updates */}
                  <div className="mt-3 pt-3 border-t border-neutral-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-400">Estimated Revenue</div>
                        <div className="text-green-400 font-medium">
                          {formatCurrency((elapsedMinutes / 60) * entry.billing.billableRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-400">Labor Cost</div>
                        <div className="text-white">
                          {formatCurrency((elapsedMinutes / 60) * entry.payroll.hourlyRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-400">Projected Profit</div>
                        <div className="text-purple-400">
                          {formatCurrency(((elapsedMinutes / 60) * entry.billing.billableRate) - ((elapsedMinutes / 60) * entry.payroll.hourlyRate))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Active Time Tracking</h3>
            <p className="text-neutral-400 mb-4">All technicians have clocked out or are on break</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-green-600 hover:bg-green-700 h-16 flex-col">
            <Play className="h-6 w-6 mb-1" />
            <span>Start Time Tracking</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 h-16 flex-col">
            <User className="h-6 w-6 mb-1" />
            <span>View All Active</span>
          </Button>
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 h-16 flex-col">
            <Settings className="h-6 w-6 mb-1" />
            <span>Tracking Settings</span>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{formatTime((analytics?.overview?.totalHours || 0) * 60)}</h3>
            <p className="text-sm text-neutral-400">Total Hours</p>
            <p className="text-xs text-neutral-500">All time tracked</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{analytics?.overview.utilizationRate.toFixed(1)}%</h3>
            <p className="text-sm text-neutral-400">Utilization Rate</p>
            <p className="text-xs text-neutral-500">Billable vs total hours</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{formatCurrency(analytics?.overview.totalRevenue || 0)}</h3>
            <p className="text-sm text-neutral-400">Total Revenue</p>
            <p className="text-xs text-neutral-500">From time tracked</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{analytics?.overview.profitMargin.toFixed(1)}%</h3>
            <p className="text-sm text-neutral-400">Profit Margin</p>
            <p className="text-xs text-neutral-500">Revenue - labor cost</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Hours Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics?.trends.daily.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 rounded-t w-full transition-all hover:bg-blue-400"
                  style={{ height: '${Math.max((day.hours / 12) * 200, 4)}px' }}
                />
                <div className="text-xs text-neutral-400 mt-2 transform -rotate-45 origin-top-left">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-white font-medium">{day.hours.toFixed(1)}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Employee</h3>
          <div className="space-y-3">
            {analytics?.breakdown.byEmployee.slice(0, 5).map((emp) => (
              <div key={emp.employeeId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                    {emp.name.split(' ').map(n => n[0]).join(')}
                  </div>
                  <span className="text-neutral-300">{emp.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">{formatCurrency(emp.totalPay * 1.5)}</div>
                  <div className="text-xs text-neutral-400">{emp.totalHours.toFixed(1)}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Projects</h3>
          <div className="space-y-3">
            {analytics?.breakdown.byProject.slice(0, 4).map((project) => (
              <div key={project.jobId} className="p-3 bg-neutral-800/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-mono text-sm text-blue-400">{project.workOrder}</div>
                    <div className="text-xs text-neutral-400">{project.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">{formatCurrency(project.billableAmount)}</div>
                    <div className="text-xs text-neutral-400">{project.totalHours}h</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Profit Margin:</span>
                  <span className={'font-medium ${
                    project.profitMargin >= 30 ? 'text-green-400' :
                    project.profitMargin >= 20 ? 'text-yellow-400' : 'text-red-400`
              }'}>'
                    {project.profitMargin}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Efficiency</h3>
          <div className="space-y-3">
            {analytics?.breakdown.byTask.map((task) => (
              <div key={task.category} className="flex items-center justify-between">
                <div>
                  <span className="text-neutral-300 capitalize">{task.category}</span>
                  <div className="text-xs text-neutral-400">{task.averageTime}min avg</div>
                </div>
                <div className="text-right">
                  <div className={'text-sm font-medium ${
                    task.efficiency >= 90 ? 'text-green-400' :
                    task.efficiency >= 80 ? 'text-yellow-400' : 'text-red-400`
              }'}>'
                    {task.efficiency}%
                  </div>
                  <div className="text-xs text-neutral-400">{task.totalHours.toFixed(1)}h total</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
          <div className="space-y-3">
            {analytics?.trends.monthly.slice(-4).map((month, index) => {
              const profit = month.revenue - month.cost
              const margin = month.revenue > 0 ? (profit / month.revenue) * 100 : 0
              return (
                <div key={index} className="p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{month.month}</span>
                    <span className="text-green-400">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Hours: {month.hours}</span>
                    <span className={'${margin >= 20 ? 'text-green-400' : margin >= 10 ? 'text-yellow-400' : 'text-red-400'
              }'}>'
                      {margin.toFixed(1)}% margin
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'live':
        return renderLiveTracking()
      case 'entries':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Time Entries</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Employees</option>
                  {Array.from(new Set(timeEntries.map(e => e.employeeName))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            {(DataTable as any)({
              columns: timeEntryColumns,
              data: filteredEntries,
              className: "border-0"
            })}
          </div>
        )
      case 'timesheets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Timesheets</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Generate Timesheet
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timesheets.slice(0, 9).map((timesheet) => (
                <div key={timesheet.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{timesheet.employeeName}</h3>
                      <p className="text-sm text-neutral-400">
                        Week {timesheet.payPeriod.weekNumber} - {new Date(timesheet.payPeriod.start).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={'px-2 py-1 rounded text-xs font-medium ${
                      timesheet.status === 'approved' ? 'bg-green-800 text-green-200' :
                      timesheet.status === 'submitted' ? 'bg-blue-800 text-blue-200' :
                      timesheet.status === 'paid' ? 'bg-purple-800 text-purple-200' :
                      'bg-neutral-800 text-neutral-200'
              }'}>'
                      {timesheet.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Total Hours:</span>
                      <span className="text-white">{timesheet.summary.totalHours.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Regular:</span>
                      <span className="text-white">{timesheet.summary.regularHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Overtime:</span>
                      <span className="text-yellow-400">{timesheet.summary.overtimeHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Billable:</span>
                      <span className="text-green-400">{timesheet.summary.billableHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-neutral-800">
                      <span className="text-neutral-400">Net Pay:</span>
                      <span className="text-green-400 font-medium">{formatCurrency(timesheet.payroll.netPay)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'analytics':
        return renderAnalytics()
      case 'approvals':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
              <div className="text-sm text-neutral-400">
                {filteredEntries.filter(e => e.status === 'pending_approval').length} requiring review
              </div>
            </div>
            <div className="space-y-4">
              {filteredEntries
                .filter(entry => entry.status === 'pending_approval')
                .map((entry) => (
                  <div key={entry.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-3">
                          {entry.employeeName.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="text-white font-medium">{entry.employeeName}</div>
                          <div className="text-sm text-neutral-400">{entry.job.workOrderNumber} - {entry.job.customer}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatTime(entry.timeLog.totalMinutes)}</div>
                        <div className="text-sm text-neutral-400">
                          {new Date(entry.timeLog.clockIn).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-neutral-400">Task</div>
                        <div className="text-white">{entry.task.name}</div>
                        <div className="text-xs text-neutral-500">{entry.task.category}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-400">Billing</div>
                        <div className="text-green-400 font-medium">{formatCurrency(entry.billing.customerCharge)}</div>
                        <div className="text-xs text-neutral-500">{formatTime(entry.timeLog.billableMinutes)} billable</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-400">Location</div>
                        <div className={'text-sm ${entry.location.onSiteVerification ? 'text-green-400' : 'text-yellow-400'
              }'}>'
                          {entry.location.onSiteVerification ? 'Verified' : 'Unverified'}
                        </div>
                        <div className="text-xs text-neutral-500">GPS ±{entry.location.clockInLocation?.accuracy}m</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700 text-red-400 border-red-800">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Time Tracking Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Default Break Duration</label>
                    <select className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Overtime Threshold</label>
                    <input 
                      type="number" 
                      defaultValue="40" 
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                      placeholder="Hours per week"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Time Rounding</label>
                    <select className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                      <option>Exact minutes</option>
                      <option>Round to 15 minutes</option>
                      <option>Round to 30 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">GPS & Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-neutral-300">Require GPS verification</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Location Accuracy Threshold</label>
                    <select className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                      <option>50 meters</option>
                      <option>100 meters</option>
                      <option>250 meters</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-neutral-300">Allow clock-in outside job location</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-neutral-300">Track location during work</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Approval Workflow</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-neutral-300">Require supervisor approval</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-neutral-300">Auto-approve entries under 8 hours</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-neutral-300">Require approval for overtime</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Auto-approval after</label>
                    <select className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                      <option>Never</option>
                      <option>24 hours</option>
                      <option>48 hours</option>
                      <option>7 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Notification Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-neutral-300">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-neutral-300">SMS notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
              <Button variant="outline" className="bg-neutral-800 border-neutral-700">Reset to Defaults</Button>
            </div>
          </div>
        )
      default:
        return renderLiveTracking()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Time Tracking & Labor Analysis</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Monitor workforce productivity, track billable hours, and analyze labor costs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-400">
                Current Time: <span className="text-white font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-800/50 p-1 rounded-lg">
            {[
              { key: 'live', label: 'Live Tracking', icon: Activity },
              { key: 'entries', label: 'Time Entries', icon: Clock },
              { key: 'timesheets', label: 'Timesheets', icon: FileText },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'approvals', label: 'Approvals', icon: CheckCircle },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className={activeTab === tab.key 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Time Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Time Entry Details</h3>
                <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Employee & Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Employee:</span>
                        <span className="text-white">{selectedEntry.employeeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Work Order:</span>
                        <span className="text-blue-400 font-mono">{selectedEntry.job.workOrderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Customer:</span>
                        <span className="text-white">{selectedEntry.job.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Service:</span>
                        <span className="text-white">{selectedEntry.job.service}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Time Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Clock In:</span>
                        <span className="text-white">{new Date(selectedEntry.timeLog.clockIn).toLocaleString()}</span>
                      </div>
                      {selectedEntry.timeLog.clockOut && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Clock Out:</span>
                          <span className="text-white">{new Date(selectedEntry.timeLog.clockOut).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Time:</span>
                        <span className="text-white font-medium">{formatTime(selectedEntry.timeLog.totalMinutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Billable Time:</span>
                        <span className="text-green-400 font-medium">{formatTime(selectedEntry.timeLog.billableMinutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Break Time:</span>
                        <span className="text-yellow-400">{formatTime(selectedEntry.timeLog.breakMinutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Travel Time:</span>
                        <span className="text-blue-400">{formatTime(selectedEntry.timeLog.travelMinutes)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Location Verification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">On-site Verification:</span>
                        <span className={selectedEntry.location.onSiteVerification ? 'text-green-400' : 'text-red-400'}>
                          {selectedEntry.location.onSiteVerification ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">GPS Accuracy:</span>
                        <span className="text-white">±{selectedEntry.location.clockInLocation?.accuracy}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Clock-in Location:</span>
                        <span className="text-white text-xs">{selectedEntry.location.clockInLocation?.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Financial Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Hourly Rate:</span>
                        <span className="text-white">{formatCurrency(selectedEntry.payroll.hourlyRate)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Regular Pay:</span>
                        <span className="text-white">{formatCurrency(selectedEntry.payroll.regularPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Overtime Pay:</span>
                        <span className="text-yellow-400">{formatCurrency(selectedEntry.payroll.overtimePay)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-neutral-400">Total Pay:</span>
                        <span className="text-green-400">{formatCurrency(selectedEntry.payroll.totalPay)}</span>
                      </div>
                      <hr className="border-neutral-700" />
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Billable Rate:</span>
                        <span className="text-white">{formatCurrency(selectedEntry.billing.billableRate)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Billable Amount:</span>
                        <span className="text-blue-400">{formatCurrency(selectedEntry.billing.billableAmount)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-neutral-400">Customer Charge:</span>
                        <span className="text-green-400">{formatCurrency(selectedEntry.billing.customerCharge)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Device & Metadata</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Device:</span>
                        <span className="text-white">{selectedEntry.metadata.device}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Battery:</span>
                        <span className="text-white">{selectedEntry.metadata.batteryLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Connectivity:</span>
                        <span className={selectedEntry.metadata.connectivity === 'online' ? 'text-green-400' : 'text-red-400'}>
                          {selectedEntry.metadata.connectivity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Sync Status:</span>
                        <span className={selectedEntry.metadata.syncStatus === 'synced' ? 'text-green-400' : 'text-yellow-400'}>
                          {selectedEntry.metadata.syncStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEntry.notes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3">Notes</h4>
                      <div className="space-y-2">
                        {selectedEntry.notes.map((note, index) => (
                          <div key={index} className="p-2 bg-neutral-800/50 rounded text-sm text-neutral-300">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedEntry.photos.map((photo) => (
                          <div key={photo.id} className="bg-neutral-800 rounded-lg p-2 flex items-center">
                            <Camera className="h-4 w-4 text-neutral-400 mr-2" />
                            <span className="text-sm text-neutral-300">Photo {photo.id.split('-')[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Entry
                </Button>
                {selectedEntry.status === 'pending_approval' && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" className="bg-neutral-800 border-neutral-700 text-red-400 border-red-800">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" className="bg-neutral-800 border-neutral-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}