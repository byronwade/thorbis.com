import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Car,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MoreVertical
} from 'lucide-react'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'


interface Vehicle {
  id: string
  
  // Basic vehicle info
  year: number
  make: string
  model: string
  trim?: string
  color?: string
  
  // Vehicle identification
  vin?: string
  licensePlate?: string
  
  // Technical specs
  engine?: {
    size: string
    fuelType: string
  }
  transmission?: string
  
  // Mileage tracking
  currentMileage: number
  lastServiceMileage?: number
  
  // Owner information
  customer: {
    id: string
    name: string
    phone: string
  }
  
  // Service metrics
  serviceHistory: {
    totalServices: number
    totalSpent: number
    lastServiceDate?: string
    nextServiceDue?: string
    avgMilesBetweenService: number
  }
  
  // Maintenance reminders
  upcomingMaintenance: Array<{
    type: string
    dueMileage?: number
    dueDate?: string
    overdue: boolean
  }>
  
  createdAt: string
  updatedAt: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      // Mock vehicle data
      setVehicles([
        {
          id: '1',
          year: 2020,
          make: 'Honda',
          model: 'Civic',
          trim: 'EX',
          color: 'Blue',
          vin: '1HGBH41JXMN109186',
          licensePlate: 'ABC123',
          engine: {
            size: '2.0L',
            fuelType: 'gasoline'
          },
          transmission: 'automatic',
          currentMileage: 45250,
          lastServiceMileage: 42500,
          customer: {
            id: '1',
            name: 'Michael Johnson',
            phone: '(555) 123-4567'
          },
          serviceHistory: {
            totalServices: 8,
            totalSpent: 2150,
            lastServiceDate: '2024-01-05T10:00:00Z',
            nextServiceDue: '2024-03-15T10:00:00Z',
            avgMilesBetweenService: 3500
          },
          upcomingMaintenance: [
            {
              type: 'Oil Change',
              dueMileage: 48000,
              overdue: false
            },
            {
              type: 'Brake Inspection',
              dueDate: '2024-02-01T10:00:00Z',
              overdue: true
            }
          ],
          createdAt: '2022-06-15T10:00:00Z',
          updatedAt: '2024-01-05T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<Vehicle>[] = [
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (vehicle) => (
        <div>
          <div className="font-medium">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          {vehicle.trim && (
            <div className="text-sm text-muted-foreground">{vehicle.trim}</div>
          )}
          {vehicle.licensePlate && (
            <div className="text-sm text-muted-foreground font-mono">
              {vehicle.licensePlate}
            </div>
          )}
          {vehicle.color && (
            <div className="text-xs text-muted-foreground">{vehicle.color}</div>
          )}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Owner',
      render: (vehicle) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="h-3 w-3 mr-1" />
            {vehicle.customer.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {vehicle.customer.phone}
          </div>
        </div>
      )
    },
    {
      key: 'mileage',
      label: 'Mileage',
      width: '120px',
      sortable: true,
      render: (vehicle) => (
        <div className="text-sm">
          <div className="font-medium">
            {vehicle.currentMileage.toLocaleString()} mi
          </div>
          {vehicle.lastServiceMileage && (
            <div className="text-muted-foreground">
              Last: {vehicle.lastServiceMileage.toLocaleString()}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            +{(vehicle.currentMileage - (vehicle.lastServiceMileage || 0)).toLocaleString()} since service
          </div>
        </div>
      )
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      width: '140px',
      render: (vehicle) => {
        const overdueCount = vehicle.upcomingMaintenance.filter(m => m.overdue).length
        const upcomingCount = vehicle.upcomingMaintenance.filter(m => !m.overdue).length
        
        return (
          <div className="text-sm">
            {overdueCount > 0 && (
              <div className="flex items-center text-red-500 mb-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {overdueCount} overdue
              </div>
            )}
            {upcomingCount > 0 && (
              <div className="flex items-center text-orange-500">
                <Clock className="h-3 w-3 mr-1" />
                {upcomingCount} upcoming
              </div>
            )}
            {overdueCount === 0 && upcomingCount === 0 && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Up to date
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'serviceHistory',
      label: 'Service Value',
      width: '140px',
      align: 'right',
      render: (vehicle) => (
        <div className="text-right text-sm">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {vehicle.serviceHistory.totalSpent.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            {vehicle.serviceHistory.totalServices} services
          </div>
          {vehicle.serviceHistory.lastServiceDate && (
            <div className="text-xs text-muted-foreground mt-1">
              Last: {new Date(vehicle.serviceHistory.lastServiceDate).toLocaleDateString()}
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
      onClick: (vehicles: Vehicle[]) => {
        console.log('View vehicle details:', vehicles[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (vehicles: Vehicle[]) => {
        console.log('Edit vehicle:', vehicles[0].id)
      }
    },
    {
      label: 'New Service',
      icon: Wrench,
      onClick: (vehicles: Vehicle[]) => {
        console.log('Create service for vehicle:', vehicles[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Schedule Maintenance',
      icon: Calendar,
      onClick: (selectedVehicles: Vehicle[]) => {
        console.log('Schedule maintenance:', selectedVehicles)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedVehicles: Vehicle[]) => {
        console.log('Export vehicles:', selectedVehicles)
      },
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'make',
      label: 'Make',
      type: 'select' as const,
      options: [
        { label: 'All Makes', value: ' },
        { label: 'Honda', value: 'honda' },
        { label: 'Toyota', value: 'toyota' },
        { label: 'Ford', value: 'ford' },
        { label: 'Chevrolet', value: 'chevrolet' },
        { label: 'BMW', value: 'bmw' },
        { label: 'Mercedes', value: 'mercedes' }
      ],
      value: ',
      onChange: (value: string) => console.log('Make filter:', value)
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      type: 'select' as const,
      options: [
        { label: 'All Vehicles', value: ' },
        { label: 'Overdue Maintenance', value: 'overdue' },
        { label: 'Due Soon', value: 'due_soon' },
        { label: 'Up to Date', value: 'up_to_date' }
      ],
      value: ',
      onChange: (value: string) => console.log('Maintenance filter:', value)
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Vehicles</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Vehicle database and maintenance tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              Maintenance Schedule
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={vehicles}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Search vehicles by make, model, VIN, or license plate..."
          selectable
          bulkActions={bulkActions}
          rowActions={rowActions}
          filters={filters}
          onRowClick={(vehicle) => {
            console.log('Navigate to vehicle details:', vehicle.id)
          }}
          paginated
          emptyState={
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No vehicles found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first vehicle to start tracking service history
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
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
