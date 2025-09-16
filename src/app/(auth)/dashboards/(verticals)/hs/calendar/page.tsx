'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Settings,
  MapPin,
  Clock,
  User,
  Wrench,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Navigation,
  Star,
  Tag,
  Users,
  Activity,
  Zap,
  Target,
  Calendar as CalIcon,
  Timer,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react'


interface CalendarJob {
  id: string
  workOrderNumber: string
  title: string
  customer: {
    name: string
    phone: string
    address: string
    priority: 'standard' | 'vip' | 'emergency'
  }
  service: {
    type: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'maintenance'
    category: string
    description: string
    estimatedDuration: number
    difficulty: 'easy' | 'medium' | 'hard'
  }
  technician: {
    id: string
    name: string
    skills: string[]
    avatar?: string
    truck: string
  }
  schedule: {
    date: string
    startTime: string
    endTime: string
    timeWindow?: string
    buffer: number
    isFlexible: boolean
  }
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    travelTime: number
    distance: number
  }
  pricing: {
    estimatedValue: number
    materialCost: number
    laborCost: number
    totalCost: number
  }
  requirements: {
    parts: Array<{
      name: string
      quantity: number
      inStock: boolean
    }>
    tools: string[]
    specialInstructions?: string
    accessRequirements?: string
  }
  tags: string[]
  color: string
  isDraggable: boolean
  isRecurring: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    interval: number
    endDate?: string
  }
}

interface CalendarView {
  type: 'day' | 'week' | 'month'
  date: Date
}

interface TechnicianSchedule {
  technicianId: string
  name: string
  skills: string[]
  availability: {
    start: string
    end: string
    breaks: Array<{
      start: string
      end: string
      type: 'lunch' | 'break' | 'travel'
    }>
  }
  capacity: {
    maxJobs: number
    maxHours: number
    currentJobs: number
    currentHours: number
  }
  location: {
    current?: {
      lat: number
      lng: number
      address: string
    }
    home: {
      lat: number
      lng: number
      address: string
    }
  }
  truck: {
    id: string
    name: string
    inventory: Array<{
      item: string
      quantity: number
    }>
  }
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<CalendarView>({ type: 'week', date: new Date() })
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [technicians, setTechnicians] = useState<TechnicianSchedule[]>([])
  const [selectedJob, setSelectedJob] = useState<CalendarJob | null>(null)
  const [filters, setFilters] = useState({
    technician: 'all',
    serviceType: 'all',
    status: 'all',
    showCompleted: false
  })
  const [draggedJob, setDraggedJob] = useState<CalendarJob | null>(null)
  const [activeTimeSlot, setActiveTimeSlot] = useState<string | null>(null)

  useEffect(() => {
    fetchCalendarData()
  }, [view])

  const fetchCalendarData = async () => {
    try {
      // Generate comprehensive calendar data
      const mockTechnicians: TechnicianSchedule[] = [
        {
          technicianId: 'tech-001',
          name: 'Mike Rodriguez',
          skills: ['HVAC', 'Refrigeration', 'Electrical'],
          availability: {
            start: '07:00',
            end: '18:00',
            breaks: [
              { start: '12:00', end: '13:00', type: 'lunch' },
              { start: '15:00', end: '15:15', type: 'break' }
            ]
          },
          capacity: {
            maxJobs: 8,
            maxHours: 10,
            currentJobs: 5,
            currentHours: 7.5
          },
          location: {
            current: {
              lat: 39.7817,
              lng: -89.6501,
              address: '1234 Oak Street, Springfield, IL'
            },
            home: {
              lat: 39.7817,
              lng: -89.6501,
              address: 'Home Base - Springfield'
            }
          },
          truck: {
            id: 'truck-hvac-01',
            name: 'HVAC Unit 1',
            inventory: [
              { item: 'Capacitor 35µF', quantity: 12 },
              { item: 'Refrigerant R-410A', quantity: 5 },
              { item: 'Thermostat', quantity: 8 }
            ]
          }
        },
        {
          technicianId: 'tech-002',
          name: 'Sarah Johnson',
          skills: ['Plumbing', 'Drain Cleaning', 'Water Heaters'],
          availability: {
            start: '08:00',
            end: '17:00',
            breaks: [
              { start: '12:30', end: '13:30', type: 'lunch' }
            ]
          },
          capacity: {
            maxJobs: 6,
            maxHours: 8,
            currentJobs: 4,
            currentHours: 6
          },
          location: {
            current: {
              lat: 39.7817,
              lng: -89.6501,
              address: '5678 Maple Avenue, Springfield, IL'
            },
            home: {
              lat: 39.7817,
              lng: -89.6501,
              address: 'Home Base - Springfield'
            }
          },
          truck: {
            id: 'truck-plumb-01',
            name: 'Plumbing Unit 1',
            inventory: [
              { item: 'PVC Pipe 3"', quantity: 20 },"
              { item: 'Drain Snake Cable', quantity: 3 },
              { item: 'Pipe Fittings', quantity: 45 }
            ]
          }
        },
        {
          technicianId: 'tech-003',
          name: 'David Chen',
          skills: ['Electrical', 'Panel Upgrades', 'Wiring'],
          availability: {
            start: '07:30',
            end: '16:30',
            breaks: [
              { start: '12:00', end: '12:30', type: 'lunch' },
              { start: '10:00', end: '10:15', type: 'break' }
            ]
          },
          capacity: {
            maxJobs: 5,
            maxHours: 8,
            currentJobs: 3,
            currentHours: 5.5
          },
          location: {
            current: {
              lat: 39.7817,
              lng: -89.6501,
              address: '9012 Pine Street, Springfield, IL'
            },
            home: {
              lat: 39.7817,
              lng: -89.6501,
              address: 'Home Base - Springfield'
            }
          },
          truck: {
            id: 'truck-elec-01',
            name: 'Electrical Unit 1',
            inventory: [
              { item: '12 AWG Wire', quantity: 500 },
              { item: 'Circuit Breakers', quantity: 24 },
              { item: 'Electrical Outlets', quantity: 30 }
            ]
          }
        }
      ]

      const mockJobs: CalendarJob[] = Array.from({ length: 35 }, (_, i) => {
        const serviceTypes = ['hvac', 'plumbing', 'electrical', 'appliance', 'maintenance'] as const
        const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const
        const priorities = ['standard', 'vip', 'emergency'] as const
        const difficulties = ['easy', 'medium', 'hard'] as const
        
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const priority = priorities[Math.floor(Math.random() * priorities.length)]
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
        const technician = mockTechnicians[Math.floor(Math.random() * mockTechnicians.length)]
        
        const baseDate = new Date()
        const dayOffset = Math.floor(Math.random() * 14) - 7 // Past 7 days to future 7 days
        const jobDate = new Date(baseDate)
        jobDate.setDate(baseDate.getDate() + dayOffset)
        
        const startHour = Math.floor(Math.random() * 9) + 8 // 8 AM to 4 PM
        const startTime = '${String(startHour).padStart(2, '0')}:${Math.random() < 0.5 ? '00' : '30'}'}
        const duration = Math.floor(Math.random() * 4) + 1 // 1-4 hours
        const endHour = startHour + duration
        const endTime = '${String(endHour).padStart(2, '0')}:${startTime.split(':')[1]}'}
        
        const estimatedValue = Math.floor(Math.random() * 1500) + 200
        const materialCost = Math.floor(estimatedValue * 0.4)
        const laborCost = Math.floor(estimatedValue * 0.6)
        
        return {
          id: 'job-${String(i + 1).padStart(3, '0')}',
          workOrderNumber: 'WO-2024-${String(i + 1000).padStart(4, '0')}',
          title: '${serviceType.toUpperCase()} - ${
            serviceType === 'hvac' ? ['AC Repair', 'Heating Service', 'Installation'][Math.floor(Math.random() * 3)] :
            serviceType === 'plumbing' ? ['Drain Cleaning', 'Leak Repair', 'Water Heater'][Math.floor(Math.random() * 3)] :
            serviceType === 'electrical' ? ['Panel Upgrade', 'Outlet Installation', 'Wiring'][Math.floor(Math.random() * 3)] :
            serviceType === 'appliance' ? ['Washer Repair', 'Dryer Service', 'Refrigerator'][Math.floor(Math.random() * 3)] :
            'Maintenance Check'
          }',
          customer: {
            name: ['John Smith', 'Sarah Davis', 'Mike Johnson', 'Jennifer Wilson', 'David Brown', 'Amy Martinez'][Math.floor(Math.random() * 6)],
            phone: '(217) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}',
            address: '${Math.floor(Math.random() * 9999) + 1} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Elm', 'Birch'][Math.floor(Math.random() * 6)]} Street, Springfield, IL 627${String(Math.floor(Math.random() * 10)).padStart(2, '0')}',
            priority
          },
          service: {
            type: serviceType,
            category: serviceType === 'hvac' ? 'Air Conditioning' :
                     serviceType === 'plumbing' ? 'Drain Service' :
                     serviceType === 'electrical' ? 'Installation' :
                     serviceType === 'appliance' ? 'Repair' : 'Maintenance',
            description: 'Professional ${serviceType} service with comprehensive diagnosis and repair',
            estimatedDuration: duration * 60,
            difficulty
          },
          technician: {
            id: technician.technicianId,
            name: technician.name,
            skills: technician.skills,
            truck: technician.truck.name
          },
          schedule: {
            date: jobDate.toISOString().split('T`)[0],
            startTime,
            endTime,
            timeWindow: `${startTime} - ${endTime}',
            buffer: 15,
            isFlexible: Math.random() < 0.3
          },
          status,
          location: {
            address: '${Math.floor(Math.random() * 9999) + 1} Customer Street, Springfield, IL',
            coordinates: {
              lat: 39.7817 + (Math.random() - 0.5) * 0.1,
              lng: -89.6501 + (Math.random() - 0.5) * 0.1
            },
            travelTime: Math.floor(Math.random() * 30) + 10,
            distance: Math.floor(Math.random() * 20) + 5
          },
          pricing: {
            estimatedValue,
            materialCost,
            laborCost,
            totalCost: materialCost + laborCost
          },
          requirements: {
            parts: [
              {
                name: serviceType === 'hvac' ? 'HVAC Capacitor' : serviceType === 'plumbing' ? 'Pipe Fittings' : 'Wire Nuts',
                quantity: Math.floor(Math.random() * 5) + 1,
                inStock: Math.random() < 0.8
              }
            ],
            tools: ['${serviceType} Tools', 'Diagnostic Equipment'],
            specialInstructions: Math.random() < 0.3 ? 'Customer prefers morning appointments' : undefined,
            accessRequirements: Math.random() < 0.2 ? 'Key under mat' : undefined
          },
          tags: ['Urgent', 'VIP Customer', 'Repeat Client', 'New Installation'].slice(0, Math.floor(Math.random() * 3)),
          color: serviceType === 'hvac' ? '#3B82F6' :
                 serviceType === 'plumbing' ? '#06B6D4' :
                 serviceType === 'electrical' ? '#F59E0B' :
                 serviceType === 'appliance' ? '#10B981' : '#8B5CF6',
          isDraggable: status === 'scheduled' || status === 'confirmed',
          isRecurring: Math.random() < 0.15,
          recurringPattern: Math.random() < 0.15 ? {
            frequency: ['weekly', 'monthly', 'quarterly'][Math.floor(Math.random() * 3)] as any,
            interval: 1,
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          } : undefined
        }
      })

      setJobs(mockJobs)
      setTechnicians(mockTechnicians)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(job => job.schedule.date === dateStr)
  }

  const getJobsForTechnician = (technicianId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(job => 
      job.technician.id === technicianId && 
      job.schedule.date === dateStr &&
      (filters.status === 'all' || job.status === filters.status) &&
      (filters.serviceType === 'all' || job.service.type === filters.serviceType)
    )
  }

  const getCalendarStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeek = jobs.filter(job => {
      const jobDate = new Date(job.schedule.date)
      const startOfWeek = new Date(view.date)
      startOfWeek.setDate(view.date.getDate() - view.date.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return jobDate >= startOfWeek && jobDate <= endOfWeek
    })

    return {
      totalJobs: thisWeek.length,
      scheduledJobs: thisWeek.filter(j => j.status === 'scheduled').length,
      completedJobs: thisWeek.filter(j => j.status === 'completed').length,
      totalRevenue: thisWeek
        .filter(j => j.status === 'completed')
        .reduce((sum, j) => sum + j.pricing.estimatedValue, 0),
      utilizationRate: Math.round((thisWeek.length / (technicians.length * 7 * 8)) * 100), // Assuming 8 job slots per day per tech
      avgJobValue: thisWeek.length > 0 
        ? Math.round(thisWeek.reduce((sum, j) => sum + j.pricing.estimatedValue, 0) / thisWeek.length)
        : 0
    }
  }

  const stats = getCalendarStats()

  const handleDragStart = (job: CalendarJob) => {
    if (job.isDraggable) {
      setDraggedJob(job)
    }
  }

  const handleDrop = (targetDate: string, targetTime: string, targetTechnicianId?: string) => {
    if (!draggedJob) return

    const updatedJob = {
      ...draggedJob,
      schedule: {
        ...draggedJob.schedule,
        date: targetDate,
        startTime: targetTime
      },
      technician: targetTechnicianId 
        ? {
            ...draggedJob.technician,
            id: targetTechnicianId,
            name: technicians.find(t => t.technicianId === targetTechnicianId)?.name || draggedJob.technician.name
          }
        : draggedJob.technician
    }

    setJobs(prev => prev.map(job => 
      job.id === draggedJob.id ? updatedJob : job
    ))
    setDraggedJob(null)
  }

  const renderTimeSlots = () => {
    const slots = []
    for (const hour = 7;
import { Button } from '@/components/ui/button';
 hour <= 18; hour++) {
      slots.push(
        <div key={'${hour}:00'} className="border-b border-neutral-800 h-16 flex items-center px-2 text-sm text-neutral-400">
          {hour === 12 ? '12:00 PM` : hour > 12 ? `${hour - 12}:00 PM` : '${hour}:00 AM'}
        </div>
      )
    }
    return slots
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(view.date)
    startOfWeek.setDate(view.date.getDate() - view.date.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })

    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Time Column */}
        <div className="w-20 border-r border-neutral-800 bg-neutral-925">
          <div className="h-16 border-b border-neutral-800 flex items-center justify-center">
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          {renderTimeSlots()}
        </div>

        {/* Days Columns */}
        <div className="flex-1 flex">
          {weekDays.map((date, dayIndex) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const dayJobs = getJobsForDate(date)
            
            return (
              <div key={dayIndex} className="flex-1 border-r border-neutral-800">
                {/* Day Header */}
                <div className={'h-16 border-b border-neutral-800 flex flex-col items-center justify-center ${
                  isToday ? 'bg-blue-900/20 border-blue-800' : 'bg-neutral-925'
              }'}>'
                  <div className="text-sm text-neutral-400">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={'text-lg font-semibold ${
                    isToday ? 'text-blue-400' : 'text-white`
              }'}>'
                    {date.getDate()}
                  </div>
                </div>

                {/* Day Content */}
                <div className="relative h-full">
                  {/* Time Slots */}
                  {Array.from({ length: 12 }, (_, hour) => (
                    <div
                      key={hour + 7}
                      className="border-b border-neutral-800 h-16 hover:bg-neutral-800/30 transition-colors"
                      onDrop={(e) => {
                        e.preventDefault()
                        const time = '${String(hour + 7).padStart(2, '0')}:00'
                        handleDrop(date.toISOString().split('T')[0], time)
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    />
                  ))}

                  {/* Jobs */}
                  {dayJobs.map((job) => {
                    const startHour = parseInt(job.schedule.startTime.split(':')[0])
                    const startMinute = parseInt(job.schedule.startTime.split(':')[1])
                    const topOffset = ((startHour - 7) * 64) + (startMinute / 60 * 64)
                    const duration = job.service.estimatedDuration / 60
                    const height = Math.max(duration * 64, 32)

                    return (
                      <div
                        key={job.id}
                        draggable={job.isDraggable}
                        onDragStart={() => handleDragStart(job)}
                        onClick={() => setSelectedJob(job)}
                        className={'absolute left-1 right-1 rounded p-1 text-xs cursor-pointer border-l-4 ${
                          job.isDraggable ? 'hover:opacity-80' : 'opacity-75'
              }'}
                        style={{
                          top: topOffset,
                          height: height,
                          backgroundColor: job.color + '20',
                          borderLeftColor: job.color,
                          zIndex: job.status === 'in_progress' ? 10 : 5
                        }}
                      >
                        <div className="font-medium text-white text-xs truncate">
                          {job.customer.name}
                        </div>
                        <div className="text-neutral-400 text-xs truncate">
                          {job.service.category}
                        </div>
                        <div className="text-neutral-400 text-xs">
                          {job.schedule.startTime} - {job.schedule.endTime}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className={'w-2 h-2 rounded-full ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'in_progress' ? 'bg-blue-500' :
                            job.status === 'scheduled' ? 'bg-neutral-500' :
                            'bg-red-500'
              }'} />'
                          {job.customer.priority === 'emergency' && (
                            <AlertCircle className="h-3 w-3 text-red-400" />
                          )}
                          {job.customer.priority === 'vip` && (
                            <Star className="h-3 w-3 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTechnicianView = () => (
    <div className="flex flex-1 overflow-hidden">
      {/* Time Column */}
      <div className="w-20 border-r border-neutral-800 bg-neutral-925">
        <div className="h-16 border-b border-neutral-800 flex items-center justify-center">
          <Clock className="h-4 w-4 text-neutral-400" />
        </div>
        {renderTimeSlots()}
      </div>

      {/* Technician Columns */}
      <div className="flex-1 flex">
        {technicians.map((tech) => (
          <div key={tech.technicianId} className="flex-1 border-r border-neutral-800">
            {/* Technician Header */}
            <div className="h-16 border-b border-neutral-800 bg-neutral-925 p-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{tech.name}</div>
                  <div className="text-xs text-neutral-400">{tech.skills[0]}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-400">
                    {tech.capacity.currentJobs}/{tech.capacity.maxJobs} jobs
                  </div>
                  <div className={'w-full bg-neutral-800 rounded-full h-1.5 mt-1'}>
                    <div 
                      className={'h-1.5 rounded-full ${
                        tech.capacity.currentJobs / tech.capacity.maxJobs > 0.8 ? 'bg-red-500' :
                        tech.capacity.currentJobs / tech.capacity.maxJobs > 0.6 ? 'bg-yellow-500' :
                        'bg-green-500`
              }`}
                      style={{ width: '${(tech.capacity.currentJobs / tech.capacity.maxJobs) * 100}%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Technician Schedule */}
            <div className="relative h-full">
              {/* Time Slots */}
              {Array.from({ length: 12 }, (_, hour) => (
                <div
                  key={hour + 7}
                  className="border-b border-neutral-800 h-16 hover:bg-neutral-800/30 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault()
                    const time = '${String(hour + 7).padStart(2, '0')}:00'
                    handleDrop(view.date.toISOString().split('T')[0], time, tech.technicianId)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                />
              ))}

              {/* Jobs for this technician */}
              {getJobsForTechnician(tech.technicianId, view.date).map((job) => {
                const startHour = parseInt(job.schedule.startTime.split(':')[0])
                const startMinute = parseInt(job.schedule.startTime.split(':')[1])
                const topOffset = ((startHour - 7) * 64) + (startMinute / 60 * 64)
                const duration = job.service.estimatedDuration / 60
                const height = Math.max(duration * 64, 48)

                return (
                  <div
                    key={job.id}
                    draggable={job.isDraggable}
                    onDragStart={() => handleDragStart(job)}
                    onClick={() => setSelectedJob(job)}
                    className={'absolute left-1 right-1 rounded p-2 text-xs cursor-pointer border-l-4 ${
                      job.isDraggable ? 'hover:opacity-80' : 'opacity-75'
              }'}
                    style={{
                      top: topOffset,
                      height: height,
                      backgroundColor: job.color + '20',
                      borderLeftColor: job.color
                    }}
                  >
                    <div className="font-medium text-white truncate">
                      {job.customer.name}
                    </div>
                    <div className="text-neutral-400 truncate">
                      {job.service.category}
                    </div>
                    <div className="text-neutral-400">
                      {job.schedule.startTime}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-green-400 font-medium">
                        ${job.pricing.estimatedValue}
                      </span>
                      {job.customer.priority === 'emergency' && (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-white">Advanced Calendar</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(prev => ({ 
                  ...prev, 
                  date: new Date(prev.date.setDate(prev.date.getDate() - (prev.type === 'day' ? 1 : 7)))
                }))}
                className="bg-neutral-800 border-neutral-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView({ ...view, date: new Date() })}
                className="bg-neutral-800 border-neutral-700 text-white"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(prev => ({ 
                  ...prev, 
                  date: new Date(prev.date.setDate(prev.date.getDate() + (prev.type === 'day' ? 1 : 7)))
                }))}
                className="bg-neutral-800 border-neutral-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-white font-medium">
              {view.date.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(view.type === 'week' ? {} : { day: 'numeric' })
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['day', 'week', 'month'].map((viewType) => (
                <Button
                  key={viewType}
                  variant={view.type === viewType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView({ ...view, type: viewType as any })}
                  className={view.type === viewType ? ' : 'bg-neutral-800 border-neutral-700'}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
            <div className="text-sm text-neutral-400">Total Jobs</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{stats.scheduledJobs}</div>
            <div className="text-sm text-neutral-400">Scheduled</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.completedJobs}</div>
            <div className="text-sm text-neutral-400">Completed</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-neutral-400">Revenue</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{stats.utilizationRate}%</div>
            <div className="text-sm text-neutral-400">Utilization</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">${stats.avgJobValue}</div>
            <div className="text-sm text-neutral-400">Avg Value</div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : view.type === 'week' ? (
          renderWeekView()
        ) : (
          renderTechnicianView()
        )}
      </div>

      {/* Job Details Modal/Sidebar */}
      {selectedJob && (
        <div className="fixed inset-y-0 right-0 w-96 bg-neutral-900 border-l border-neutral-800 p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Job Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedJob(null)}
              className="text-neutral-400 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="font-medium text-white mb-2">{selectedJob.workOrderNumber}</div>
              <div className="text-neutral-300 text-sm">{selectedJob.title}</div>
              <div className={'inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                selectedJob.status === 'completed' ? 'bg-green-800 text-green-200' :
                selectedJob.status === 'in_progress' ? 'bg-blue-800 text-blue-200' :
                selectedJob.status === 'scheduled' ? 'bg-neutral-800 text-neutral-200' :
                'bg-red-800 text-red-200'
              }'}>'
                {selectedJob.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Customer</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.customer.name}</span>
                  {selectedJob.customer.priority === 'vip' && (
                    <Star className="h-4 w-4 text-yellow-400 ml-2" />
                  )}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.customer.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.customer.address}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Schedule</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">
                    {new Date(selectedJob.schedule.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.schedule.timeWindow}</span>
                </div>
                <div className="flex items-center">
                  <Timer className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">
                    {Math.floor(selectedJob.service.estimatedDuration / 60)}h {selectedJob.service.estimatedDuration % 60}m
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Technician</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.technician.name}</span>
                </div>
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 text-neutral-400 mr-2" />
                  <span className="text-neutral-300">{selectedJob.technician.skills.join(', ')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Pricing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Estimated Value</span>
                  <span className="text-green-400 font-medium">
                    ${selectedJob.pricing.estimatedValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Material Cost</span>
                  <span className="text-neutral-300">${selectedJob.pricing.materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Labor Cost</span>
                  <span className="text-neutral-300">${selectedJob.pricing.laborCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}