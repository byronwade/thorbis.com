import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {  } from '@/components/ui';
'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'

import {
  Wrench,
  Car,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface ServiceBay {
  id: string
  number: string
  name: string
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_service'
  type: 'general' | 'alignment' | 'tire' | 'diagnostic' | 'detail' | 'oil_change'
  capacity: 'standard' | 'heavy_duty' | 'motorcycle'
  currentRepairOrder?: {
    id: string
    orderNumber: string
    vehicle: {
      year: number
      make: string
      model: string
      color: string
      licensePlate: string
    }
    customer: {
      name: string
      phone: string
    }
    services: string[]
    estimatedCompletion: Date
    progress: number
  }
  technician?: {
    id: string
    name: string
    avatar?: string
  }
  equipment: string[]
  estimatedAvailableAt?: Date
  location: {
    zone: string
    position: number
  }
}

export default function ServiceBaysPage() {
  const [serviceBays, setServiceBays] = useState<ServiceBay[]>([])
  const [filteredBays, setFilteredBays] = useState<ServiceBay[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null)
  const [loading, setLoading] = useState(true)

  // Load service bays data
  useEffect(() => {
    async function loadServiceBays() {
      try {
        const response = await fetch('/data/api/auto/service-bays')
        const data = await response.json()
        setServiceBays(data.serviceBays || [])
      } catch (error) {
        console.error('Failed to load service bays: ', error)
        
        // Mock data fallback
        const mockServiceBays: ServiceBay[] = [
          {
            id: '1',
            number: '1',
            name: 'Bay 1',
            status: 'occupied',
            type: 'general',
            capacity: 'standard',
            currentRepairOrder: {
              id: 'ro1',
              orderNumber: 'RO-2024-0123',
              vehicle: {
                year: 2020,
                make: 'Toyota',
                model: 'Camry',
                color: 'Silver',
                licensePlate: 'ABC-1234'
              },
              customer: {
                name: 'John Smith',
                phone: '(555) 123-4567'
              },
              services: ['Oil Change', 'Brake Inspection'],
              estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
              progress: 65
            },
            technician: {
              id: 'tech1',
              name: 'Mike Johnson',
              avatar: '/avatars/mike.jpg'
            },
            equipment: ['Hydraulic Lift', 'Air Compressor', 'Oil Drain'],
            estimatedAvailableAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            location: { zone: 'A', position: 1 }
          },
          {
            id: '2',
            number: '2',
            name: 'Bay 2',
            status: 'available',
            type: 'general',
            capacity: 'standard',
            equipment: ['Hydraulic Lift', 'Air Compressor', 'Diagnostic Scanner'],
            location: { zone: 'A', position: 2 }
          },
          {
            id: '3',
            number: '3',
            name: 'Bay 3',
            status: 'occupied',
            type: 'alignment',
            capacity: 'standard',
            currentRepairOrder: {
              id: 'ro2',
              orderNumber: 'RO-2024-0124',
              vehicle: {
                year: 2019,
                make: 'Honda',
                model: 'Civic',
                color: 'Blue',
                licensePlate: 'XYZ-5678'
              },
              customer: {
                name: 'Sarah Davis',
                phone: '(555) 234-5678'
              },
              services: ['Wheel Alignment', 'Tire Rotation'],
              estimatedCompletion: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
              progress: 40
            },
            technician: {
              id: 'tech2',
              name: 'Alex Rodriguez',
              avatar: '/avatars/alex.jpg'
            },
            equipment: ['Alignment Machine', 'Wheel Balancer', 'Tire Changer'],
            estimatedAvailableAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
            location: { zone: 'B', position: 1 }
          },
          {
            id: '4',
            number: '4',
            name: 'Bay 4',
            status: 'maintenance',
            type: 'diagnostic',
            capacity: 'standard',
            equipment: ['Advanced Diagnostic Scanner', 'Oscilloscope', 'Hydraulic Lift'],
            location: { zone: 'B', position: 2 }
          },
          {
            id: '5',
            number: '5',
            name: 'Bay 5',
            status: 'available',
            type: 'tire',
            capacity: 'standard',
            equipment: ['Tire Changer', 'Wheel Balancer', 'Air Compressor'],
            location: { zone: 'B', position: 3 }
          },
          {
            id: '6',
            number: '6',
            name: 'Bay 6',
            status: 'occupied',
            type: 'general',
            capacity: 'heavy_duty',
            currentRepairOrder: {
              id: 'ro3',
              orderNumber: 'RO-2024-0125',
              vehicle: {
                year: 2018,
                make: 'Ford',
                model: 'F-150',
                color: 'Black',
                licensePlate: 'TRK-9012'
              },
              customer: {
                name: 'Bob Wilson',
                phone: '(555) 345-6789'
              },
              services: ['Transmission Service', 'Engine Diagnostics'],
              estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000),
              progress: 25
            },
            technician: {
              id: 'tech3',
              name: 'Emma Thompson',
              avatar: '/avatars/emma.jpg'
            },
            equipment: ['Heavy Duty Lift', 'Transmission Jack', 'Diagnostic Scanner'],
            estimatedAvailableAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
            location: { zone: 'C', position: 1 }
          },
          {
            id: '7',
            number: '7',
            name: 'Bay 7',
            status: 'available',
            type: 'oil_change',
            capacity: 'standard',
            equipment: ['Quick Lift', 'Oil Drain', 'Air Compressor'],
            location: { zone: 'C', position: 2 }
          },
          {
            id: '8',
            number: '8',
            name: 'Bay 8',
            status: 'out_of_service',
            type: 'general',
            capacity: 'standard',
            equipment: ['Hydraulic Lift (Under Repair)', 'Air Compressor'],
            location: { zone: 'C', position: 3 }
          },
        ]
        
        setServiceBays(mockServiceBays)
      } finally {
        setLoading(false)
      }
    }

    loadServiceBays()
  }, [])

  // Filter service bays
  useEffect(() => {
    let filtered = serviceBays

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bay => bay.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(bay => bay.type === typeFilter)
    }

    setFilteredBays(filtered)
  }, [serviceBays, statusFilter, typeFilter])

  const getStatusColor = (status: ServiceBay['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'occupied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out_of_service': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
    }
  }

  const getStatusIcon = (status: ServiceBay['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'occupied': return <Wrench className="h-4 w-4 text-blue-600" />
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-600" />
      case 'out_of_service': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Car className="h-4 w-4 text-neutral-600" />
    }
  }

  const getTypeColor = (type: ServiceBay['type']) => {
    const colors = {
      'general': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'alignment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'tire': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'diagnostic': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'detail': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'oil_change': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    return colors[type] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
  }

  const updateBayStatus = (bayId: string, newStatus: ServiceBay['status']) => {
    setServiceBays(prev => 
      prev.map(bay => 
        bay.id === bayId 
          ? { ...bay, status: newStatus }
          : bay
      )
    )
    setSelectedBay(null)
  }

  const getTimeUntilAvailable = (estimatedAvailableAt?: Date) => {
    if (!estimatedAvailableAt) return '
    const now = new Date()
    const diffInMinutes = Math.floor((estimatedAvailableAt.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffInMinutes <= 0) return 'Available now'
    if (diffInMinutes < 60) return `${diffInMinutes}m remaining'
    
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return '${hours}h ${minutes}m remaining'
  }

  // Summary stats
  const totalBays = serviceBays.length
  const availableBays = serviceBays.filter(bay => bay.status === 'available').length
  const occupiedBays = serviceBays.filter(bay => bay.status === 'occupied').length
  const maintenanceBays = serviceBays.filter(bay => bay.status === 'maintenance' || bay.status === 'out_of_service').length
  const utilizationRate = Math.round((occupiedBays / totalBays) * 100)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Service Bays" description="Monitor and manage service bay utilization and assignments" />
        <div className="text-center py-8">Loading service bays...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Service Bays" description="Monitor and manage service bay utilization and assignments" />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Bays</p>
              <p className="text-2xl font-bold">{totalBays}</p>
              <p className="text-xs text-muted-foreground">{utilizationRate}% utilized</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">{availableBays}</p>
              <p className="text-xs text-muted-foreground">Ready for work</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">In Use</p>
              <p className="text-2xl font-bold">{occupiedBays}</p>
              <p className="text-xs text-muted-foreground">Active repairs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold">{maintenanceBays}</p>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="out_of_service">Out of Service</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="alignment">Alignment</SelectItem>
            <SelectItem value="tire">Tire</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
            <SelectItem value="detail">Detail</SelectItem>
            <SelectItem value="oil_change">Oil Change</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBays.map((bay) => (
          <Card 
            key={bay.id} 
            className={'cursor-pointer transition-all hover:shadow-lg ${
              selectedBay?.id === bay.id ? 'ring-2 ring-blue-500' : '`}'}
            onClick={() => setSelectedBay(bay)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{bay.name}</CardTitle>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center">
                    {getStatusIcon(bay.status)}
                    <Badge className={'ml-1 ${getStatusColor(bay.status)}'}>
                      {bay.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={getTypeColor(bay.type)}>
                    {bay.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Zone {bay.location.zone} • Position {bay.location.position} • {bay.capacity}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {bay.currentRepairOrder && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{bay.currentRepairOrder.orderNumber}</span>
                    <div className="text-xs text-muted-foreground">
                      {bay.currentRepairOrder.progress}% complete
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-sm font-medium">
                      {bay.currentRepairOrder.vehicle.year} {bay.currentRepairOrder.vehicle.make} {bay.currentRepairOrder.vehicle.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bay.currentRepairOrder.vehicle.color} • {bay.currentRepairOrder.vehicle.licensePlate}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-sm">{bay.currentRepairOrder.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{bay.currentRepairOrder.customer.phone}</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs font-medium mb-1">Services:</div>
                    <div className="flex flex-wrap gap-1">
                      {bay.currentRepairOrder.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {bay.technician && (
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{bay.technician.name}</span>
                    </div>
                  )}
                  
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '${bay.currentRepairOrder.progress}%' }}
                    />
                  </div>
                  
                  {bay.estimatedAvailableAt && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeUntilAvailable(bay.estimatedAvailableAt)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <div className="text-xs font-medium mb-1">Equipment:</div>
                <div className="flex flex-wrap gap-1">
                  {bay.equipment.slice(0, 3).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {bay.equipment.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{bay.equipment.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bay Action Panel */}
      {selectedBay && (
        <Card className="fixed bottom-4 right-4 w-80 z-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedBay.name}
              <Badge className={getStatusColor(selectedBay.status)}>
                {selectedBay.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedBay.type.replace('_', ' ')} bay • {selectedBay.capacity}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedBay.status === 'available' && (
              <>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Assign Repair Order
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </>
            )}

            {selectedBay.status === 'occupied' && selectedBay.currentRepairOrder && (
              <>
                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Work
                </Button>
                <Button variant="outline" className="w-full">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Work
                </Button>
              </>
            )}

            {selectedBay.status === 'maintenance' && (
              <Button 
                className="w-full"
                onClick={() => updateBayStatus(selectedBay.id, 'available')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Mark Available
              </Button>
            )}

            {selectedBay.status === 'out_of_service' && (
              <>
                <Button 
                  className="w-full"
                  onClick={() => updateBayStatus(selectedBay.id, 'maintenance')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Mark Under Maintenance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => updateBayStatus(selectedBay.id, 'available')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Available
                </Button>
              </>
            )}

            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setSelectedBay(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
