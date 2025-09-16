import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Phone,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface Reservation {
  id: string
  confirmationCode: string
  customer: {
    name: string
    phone: string
    email?: string
  }
  
  // Reservation details
  partySize: number
  requestedTime: string
  actualSeatingTime?: string
  estimatedDuration: number
  
  // Status
  status: 'confirmed' | 'seated' | 'cancelled' | 'no_show' | 'completed' | 'waitlist'
  priority: 'normal' | 'high' | 'vip'
  
  // Assignment
  tableId?: string
  tableNumber?: string
  hostId?: string
  
  // Special requests
  specialRequests?: string
  seatingPreference?: string
  occasion: string
  
  // Source and marketing
  source: 'phone' | 'online' | 'walk_in' | 'app' | 'third_party'
  
  // Communication
  phoneReminder: boolean
  emailReminder: boolean
  reminderSent: boolean
  
  // Notes
  notes?: string
  
  createdAt: string
  updatedAt: string
}

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  seated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  completed: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  waitlist: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
}

const statusIcons = {
  confirmed: CheckCircle,
  seated: Users,
  cancelled: XCircle,
  no_show: AlertTriangle,
  completed: CheckCircle,
  waitlist: Clock
}

const priorityColors = {
  normal: 'text-neutral-500',
  high: 'text-orange-500',
  vip: 'text-purple-500'
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      // Mock reservations data
      setReservations([
        {
          id: '1',
          confirmationCode: 'ABC123',
          customer: {
            name: 'John Smith',
            phone: '(555) 123-4567',
            email: 'john@email.com'
          },
          partySize: 4,
          requestedTime: '2024-01-15T19:00:00Z',
          estimatedDuration: 90,
          status: 'confirmed',
          priority: 'normal',
          seatingPreference: 'booth',
          occasion: 'birthday',
          source: 'online',
          phoneReminder: true,
          emailReminder: true,
          reminderSent: false,
          notes: 'Birthday celebration - please prepare dessert',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          confirmationCode: 'XYZ789',
          customer: {
            name: 'Sarah Johnson',
            phone: '(555) 987-6543'
          },
          partySize: 2,
          requestedTime: '2024-01-15T18:30:00Z',
          estimatedDuration: 60,
          status: 'seated',
          priority: 'vip',
          tableNumber: '12',
          actualSeatingTime: '2024-01-15T18:35:00Z',
          seatingPreference: 'window',
          occasion: 'anniversary',
          source: 'phone',
          phoneReminder: true,
          emailReminder: false,
          reminderSent: true,
          specialRequests: 'Quiet table please',
          createdAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-15T18:35:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Reservation>[] = [
    {
      key: 'confirmationCode',
      label: 'Confirmation',
      width: '120px',
      sortable: true,
      render: (reservation) => (
        <div>
          <div className="font-mono font-medium text-sm">{reservation.confirmationCode}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {reservation.source} booking
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (reservation) => (
        <div>
          <div className="font-medium">{reservation.customer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {reservation.customer.phone}
          </div>
          <div className="flex items-center mt-1">
            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Party of {reservation.partySize}</span>
            {reservation.priority !== 'normal' && (
              <Star className={'h-3 w-3 ml-2 ${priorityColors[reservation.priority]}'} />
            )}
          </div>
        </div>
      )
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      width: '160px',
      sortable: true,
      render: (reservation) => {
        const requestedTime = new Date(reservation.requestedTime)
        
        return (
          <div className="text-sm">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {requestedTime.toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {requestedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {reservation.estimatedDuration}m duration
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (reservation) => {
        const Icon = statusIcons[reservation.status]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reservation.status]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {reservation.status.replace('_', ' ')}
          </span>
        )
      }
    },
    {
      key: 'seating',
      label: 'Seating',
      width: '120px',
      render: (reservation) => (
        <div className="text-sm">
          {reservation.tableNumber ? (
            <div className="font-medium">Table {reservation.tableNumber}</div>
          ) : (
            <span className="text-muted-foreground">Not seated</span>
          )}
          {reservation.seatingPreference && (
            <div className="text-xs text-muted-foreground capitalize">
              Pref: {reservation.seatingPreference}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'special',
      label: 'Special',
      width: '140px',
      render: (reservation) => (
        <div className="text-sm">
          {reservation.occasion !== 'none' && (
            <div className="text-purple-600 dark:text-purple-400 capitalize text-xs mb-1">
              {reservation.occasion}
            </div>
          )}
          {reservation.specialRequests && (
            <div className="text-muted-foreground text-xs line-clamp-2">
              {reservation.specialRequests}
            </div>
          )}
          {reservation.notes && (
            <div className="text-orange-600 dark:text-orange-400 text-xs mt-1">
              Notes available
            </div>
          )}
        </div>
      )
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (reservations: Reservation[]) => {
        console.log('View reservation:', reservations[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (reservations: Reservation[]) => {
        console.log('Edit reservation:', reservations[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Send Reminders',
      icon: Phone,
      onClick: (selectedReservations: Reservation[]) => {
        console.log('Send reminders:', selectedReservations)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedReservations: Reservation[]) => {
        console.log('Export reservations:', selectedReservations)
      },
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Status', value: ' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Seated', value: 'seated' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No Show', value: 'no_show' },
        { label: 'Completed', value: 'completed' },
        { label: 'Waitlist', value: 'waitlist' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'date',
      label: 'Date',
      type: 'select' as const,
      options: [
        { label: 'All Dates', value: ' },
        { label: 'Today', value: 'today' },
        { label: 'Tomorrow', value: 'tomorrow' },
        { label: 'This Week', value: 'week' }
      ],
      value: ',
      onChange: (value: string) => console.log('Date filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reservations</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage table reservations and waitlist
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Waitlist
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={reservations}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search reservations by name, phone, or confirmation..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(reservation) => {
            console.log('Navigate to reservation details:', reservation.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No reservations found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first reservation to start managing table bookings
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          }
          density="comfortable"
          className="h-full"
        />
      </div>
    </div>
  )
}