import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  Plus,
  Eye,
  Edit,
  Wrench,
  Car,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  FileText
} from 'lucide-react'

interface RepairOrder {
  id: string
  orderNumber: string
  vehicle: {
    year: number
    make: string
    model: string
    color: string
    licensePlate: string
    vin: string
    mileage: number
  }
  customer: {
    name: string
    phone: string
    email?: string
  }
  status: 'created' | 'assigned' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  technician?: {
    id: string
    name: string
  }
  serviceBay?: string
  services: Array<{
    name: string
    description: string
    laborHours: number
    laborCost: number
    parts: Array<{
      name: string
      quantity: number
      unitCost: number
      totalCost: number
    }>
    totalCost: number
  }>
  symptoms: string
  diagnosis?: string
  createdAt: Date
  estimatedCompletion?: Date
  actualCompletion?: Date
  laborTotal: number
  partsTotal: number
  taxTotal: number
  total: number
  customerApproved?: boolean
  notes?: string
}

export default function RepairOrdersPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([])
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null)
  const [loading, setLoading] = useState(true)

  // Load repair orders data
  useEffect(() => {
    async function loadRepairOrders() {
      try {
        const response = await fetch('/data/api/auto/repair-orders')
        const data = await response.json()
        setRepairOrders(data.repairOrders || [])
      } catch (error) {
        console.error('Failed to load repair orders: ', error)
        
        // Mock data fallback
        const mockRepairOrders: RepairOrder[] = [
          {
            id: '1',
            orderNumber: 'RO-2024-0123',
            vehicle: {
              year: 2020,
              make: 'Toyota',
              model: 'Camry',
              color: 'Silver',
              licensePlate: 'ABC-1234',
              vin: '4T1BF1FK5CU123456',
              mileage: 45000
            },
            customer: {
              name: 'John Smith',
              phone: '(555) 123-4567',
              email: 'john.smith@email.com'
            },
            status: 'in_progress',
            priority: 'normal',
            technician: {
              id: 'tech1',
              name: 'Mike Johnson'
            },
            serviceBay: 'Bay 1',
            services: [
              {
                name: 'Oil Change',
                description: 'Replace engine oil and filter',
                laborHours: 0.5,
                laborCost: 45,
                parts: [
                  { name: 'Engine Oil (5qt)', quantity: 1, unitCost: 25, totalCost: 25 },
                  { name: 'Oil Filter', quantity: 1, unitCost: 12, totalCost: 12 }
                ],
                totalCost: 82
              }
            ],
            symptoms: 'Due for regular maintenance, oil change needed',
            diagnosis: 'Routine maintenance - oil and filter replacement',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000),
            laborTotal: 45,
            partsTotal: 37,
            taxTotal: 6.56,
            total: 88.56,
            customerApproved: true,
            notes: 'Customer approved work'
          },
          {
            id: '2',
            orderNumber: 'RO-2024-0124',
            vehicle: {
              year: 2019,
              make: 'Honda',
              model: 'Civic',
              color: 'Blue',
              licensePlate: 'XYZ-5678',
              vin: '19XFC2F59KE123456',
              mileage: 62000
            },
            customer: {
              name: 'Sarah Davis',
              phone: '(555) 234-5678',
              email: 'sarah.davis@email.com'
            },
            status: 'waiting_parts',
            priority: 'high',
            technician: {
              id: 'tech2',
              name: 'Alex Rodriguez'
            },
            serviceBay: 'Bay 3',
            services: [
              {
                name: 'Brake Service',
                description: 'Replace front brake pads and rotors',
                laborHours: 2.5,
                laborCost: 225,
                parts: [
                  { name: 'Front Brake Pads', quantity: 1, unitCost: 85, totalCost: 85 },
                  { name: 'Front Rotors (Pair)', quantity: 1, unitCost: 120, totalCost: 120 }
                ],
                totalCost: 430
              }
            ],
            symptoms: 'Squeaking noise when braking, vibration in steering wheel',
            diagnosis: 'Front brake pads worn, rotors need replacement due to excessive wear',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
            laborTotal: 225,
            partsTotal: 205,
            taxTotal: 34.40,
            total: 464.40,
            customerApproved: true,
            notes: 'Waiting for brake rotor delivery - ETA tomorrow morning'
          },
          {
            id: '3',
            orderNumber: 'RO-2024-0125',
            vehicle: {
              year: 2018,
              make: 'Ford',
              model: 'F-150',
              color: 'Black',
              licensePlate: 'TRK-9012',
              vin: '1FTEW1EP4JFA12345',
              mileage: 78000
            },
            customer: {
              name: 'Bob Wilson',
              phone: '(555) 345-6789'
            },
            status: 'waiting_approval',
            priority: 'normal',
            services: [
              {
                name: 'Transmission Service',
                description: 'Transmission fluid change and filter replacement',
                laborHours: 2.0,
                laborCost: 180,
                parts: [
                  { name: 'Transmission Fluid (12qt)', quantity: 1, unitCost: 60, totalCost: 60 },
                  { name: 'Transmission Filter', quantity: 1, unitCost: 35, totalCost: 35 }
                ],
                totalCost: 275
              },
              {
                name: 'Engine Diagnostics',
                description: 'Check engine light diagnostic scan',
                laborHours: 1.0,
                laborCost: 90,
                parts: [],
                totalCost: 90
              }
            ],
            symptoms: 'Check engine light on, transmission shifting roughly',
            diagnosis: 'Transmission needs service, diagnostic scan shows transmission-related codes',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            laborTotal: 270,
            partsTotal: 95,
            taxTotal: 29.20,
            total: 394.20,
            customerApproved: false,
            notes: 'Estimate sent to customer for approval'
          },
          {
            id: '4',
            orderNumber: 'RO-2024-0126',
            vehicle: {
              year: 2021,
              make: 'BMW',
              model: 'X3',
              color: 'White',
              licensePlate: 'BMW-3456',
              vin: '5UX43DP05M9123456',
              mileage: 28000
            },
            customer: {
              name: 'Emily Johnson',
              phone: '(555) 456-7890',
              email: 'emily.johnson@email.com'
            },
            status: 'completed',
            priority: 'normal',
            technician: {
              id: 'tech3',
              name: 'Emma Thompson'
            },
            services: [
              {
                name: 'Annual Service',
                description: 'Annual service inspection and maintenance',
                laborHours: 1.5,
                laborCost: 135,
                parts: [
                  { name: 'Engine Oil (6qt)', quantity: 1, unitCost: 45, totalCost: 45 },
                  { name: 'Oil Filter', quantity: 1, unitCost: 18, totalCost: 18 },
                  { name: 'Air Filter', quantity: 1, unitCost: 22, totalCost: 22 }
                ],
                totalCost: 220
              }
            ],
            symptoms: 'Annual service due',
            diagnosis: 'Routine annual maintenance completed',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
            estimatedCompletion: new Date(Date.now() - 6 * 60 * 60 * 1000),
            actualCompletion: new Date(Date.now() - 6 * 60 * 60 * 1000),
            laborTotal: 135,
            partsTotal: 85,
            taxTotal: 17.60,
            total: 237.60,
            customerApproved: true,
            notes: 'Work completed successfully, customer notified'
          },
        ]
        
        setRepairOrders(mockRepairOrders)
      } finally {
        setLoading(false)
      }
    }

    loadRepairOrders()
  }, [])

  // Filter repair orders
  useEffect(() => {
    let filtered = repairOrders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        '${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}'.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter)
    }

    setFilteredOrders(filtered)
  }, [repairOrders, searchTerm, statusFilter, priorityFilter])

  const getStatusColor = (status: RepairOrder['status']) => {
    switch (status) {
      case 'created': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'waiting_parts': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'waiting_approval': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
    }
  }

  const getPriorityColor = (priority: RepairOrder['priority']) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'normal': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
    }
  }

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (order: RepairOrder) => (
        <div>
          <div className="font-mono font-medium">{order.orderNumber}</div>
          <div className="text-xs text-muted-foreground">
            {order.createdAt.toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (order: RepairOrder) => (
        <div>
          <div className="font-medium">
            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
          </div>
          <div className="text-sm text-muted-foreground">
            {order.vehicle.color} • {order.vehicle.licensePlate}
          </div>
          <div className="text-xs text-muted-foreground">
            {order.vehicle.mileage.toLocaleString()} miles
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order: RepairOrder) => (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
        </div>
      ),
    },
    {
      key: 'services',
      label: 'Services',
      render: (order: RepairOrder) => (
        <div>
          <div className="font-medium">{order.services.length} service(s)</div>
          <div className="text-sm text-muted-foreground">
            {order.services.slice(0, 2).map(service => service.name).join(', ')}
            {order.services.length > 2 && '...'}
          </div>
        </div>
      ),
    },
    {
      key: 'technician',
      label: 'Technician',
      render: (order: RepairOrder) => (
        <div className="flex items-center">
          {order.technician ? (
            <>
              <User className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">{order.technician.name}</div>
                {order.serviceBay && (
                  <div className="text-xs text-muted-foreground">{order.serviceBay}</div>
                )}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (order: RepairOrder) => (
        <Badge className={getPriorityColor(order.priority)}>
          {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (order: RepairOrder) => (
        <div className="text-right">
          <div className="font-semibold">${order.total.toFixed(2)}</div>
          {!order.customerApproved && order.status === 'waiting_approval' && (
            <div className="text-xs text-orange-600">Pending approval</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: RepairOrder) => (
        <Badge className={getStatusColor(order.status)}>
          {order.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order: RepairOrder) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedOrder(order)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Summary stats
  const totalOrders = repairOrders.length
  const activeOrders = repairOrders.filter(order => 
    ['assigned', 'in_progress', 'waiting_parts', 'waiting_approval'].includes(order.status)
  ).length
  const completedToday = repairOrders.filter(order => 
    order.status === 'completed' && 
    order.actualCompletion &&
    order.actualCompletion.toDateString() === new Date().toDateString()
  ).length
  const totalRevenue = repairOrders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Repair Orders" description="Manage vehicle repair orders and track work progress" />
        <div className="text-center py-8">Loading repair orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Repair Orders" description="Manage vehicle repair orders and track work progress">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Repair Order
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">{activeOrders} active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-900">
              <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{activeOrders}</p>
              <p className="text-xs text-muted-foreground">Active work</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">{completedToday}</p>
              <p className="text-xs text-muted-foreground">Finished</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Completed orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
            <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Repair Orders Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        onRowClick={(order) => setSelectedOrder(order)}
        emptyState="No repair orders found matching your criteria"
      />

      {/* Repair Order Details Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-neutral-950 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                  <p className="text-muted-foreground">
                    Created {selectedOrder.createdAt.toLocaleDateString()} at {selectedOrder.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(selectedOrder.priority)}>
                    {selectedOrder.priority.charAt(0).toUpperCase() + selectedOrder.priority.slice(1)} Priority
                  </Badge>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                    ×
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Vehicle Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Vehicle:</span>
                      <span>{selectedOrder.vehicle.year} {selectedOrder.vehicle.make} {selectedOrder.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Color:</span>
                      <span>{selectedOrder.vehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">License Plate:</span>
                      <span>{selectedOrder.vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">VIN:</span>
                      <span className="font-mono text-xs">{selectedOrder.vehicle.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mileage:</span>
                      <span>{selectedOrder.vehicle.mileage.toLocaleString()} miles</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Work Assignment */}
              {selectedOrder.technician && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Work Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedOrder.technician.name}</p>
                        {selectedOrder.serviceBay && <p className="text-sm text-muted-foreground">{selectedOrder.serviceBay}</p>}
                      </div>
                      <div className="text-right">
                        {selectedOrder.estimatedCompletion && (
                          <p className="text-sm">Est. completion: {selectedOrder.estimatedCompletion.toLocaleString()}</p>
                        )}
                        {selectedOrder.actualCompletion && (
                          <p className="text-sm text-green-600">Completed: {selectedOrder.actualCompletion.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Symptoms & Diagnosis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Symptoms & Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm mb-1">Customer Symptoms:</p>
                      <p className="text-sm bg-muted p-3 rounded">{selectedOrder.symptoms}</p>
                    </div>
                    {selectedOrder.diagnosis && (
                      <div>
                        <p className="font-medium text-sm mb-1">Technician Diagnosis:</p>
                        <p className="text-sm bg-muted p-3 rounded">{selectedOrder.diagnosis}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services & Parts */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Services & Parts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.services.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${service.totalCost.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{service.laborHours}h @ ${service.laborCost / service.laborHours}/hr</p>
                          </div>
                        </div>
                        
                        {service.parts.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-sm mb-2">Parts:</p>
                            <div className="space-y-1">
                              {service.parts.map((part, partIndex) => (
                                <div key={partIndex} className="flex justify-between text-sm">
                                  <span>{part.quantity}x {part.name}</span>
                                  <span>${part.totalCost.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Totals */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Labor Total</span>
                      <span>${selectedOrder.laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parts Total</span>
                      <span>${selectedOrder.partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${selectedOrder.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    {selectedOrder.customerApproved !== undefined && (
                      <div className="flex justify-between items-center pt-2">
                        <span>Customer Approval</span>
                        <Badge className={selectedOrder.customerApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedOrder.customerApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button className="flex-1">Edit Repair Order</Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
