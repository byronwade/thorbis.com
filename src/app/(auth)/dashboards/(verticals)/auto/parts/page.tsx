import {
  Card,
  CardContent
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {  } from '@/components/ui';
'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'

import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Truck,
  DollarSign,
  BarChart3,
  Edit,
  Eye
} from 'lucide-react'

interface AutoPart {
  id: string
  name: string
  partNumber: string
  category: 'engine' | 'transmission' | 'brakes' | 'suspension' | 'electrical' | 'body' | 'interior' | 'tires' | 'fluids' | 'filters'
  brand: string
  description: string
  unitCost: number
  retailPrice: number
  currentStock: number
  minStock: number
  maxStock: number
  supplier: string
  location: string
  compatibility: string[]
  lastOrdered?: Date
  leadTime: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  rating: number
  deliveryTime: string
  minOrder: number
  activeOrders: number
  totalSpent: number
}

export default function PartsPage() {
  const [parts, setParts] = useState<AutoPart[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredParts, setFilteredParts] = useState<AutoPart[]>([])
  const [searchTerm, setSearchTerm] = useState(')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('inventory')
  const [selectedPart, setSelectedPart] = useState<AutoPart | null>(null)
  const [loading, setLoading] = useState(true)

  // Load parts data
  useEffect(() => {
    async function loadPartsData() {
      try {
        const response = await fetch('/data/api/auto/parts')
        const data = await response.json()
        setParts(data.parts || [])
        setSuppliers(data.suppliers || [])
      } catch (error) {
        console.error('Failed to load parts data: ', error)
        
        // Mock data fallback
        const mockParts: AutoPart[] = [
          {
            id: '1',
            name: 'Engine Oil Filter',
            partNumber: 'OF-12345',
            category: 'filters',
            brand: 'OEM',
            description: 'Standard engine oil filter for most vehicles',
            unitCost: 8.50,
            retailPrice: 15.99,
            currentStock: 25,
            minStock: 10,
            maxStock: 100,
            supplier: 'AutoParts Direct',
            location: 'A1-15',
            compatibility: ['Toyota Camry', 'Honda Civic', 'Universal'],
            lastOrdered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            leadTime: 3,
            status: 'in_stock',
            weight: 0.8
          },
          {
            id: '2',
            name: 'Front Brake Pads',
            partNumber: 'BP-67890',
            category: 'brakes',
            brand: 'Bosch',
            description: 'Premium ceramic brake pads for front wheels',
            unitCost: 45.00,
            retailPrice: 89.99,
            currentStock: 3,
            minStock: 5,
            maxStock: 25,
            supplier: 'Brake Masters',
            location: 'B2-08',
            compatibility: ['Honda Civic', 'Honda Accord'],
            lastOrdered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            leadTime: 2,
            status: 'low_stock',
            weight: 2.5
          },
          {
            id: '3',
            name: 'Transmission Fluid',
            partNumber: 'TF-11111',
            category: 'fluids',
            brand: 'Valvoline',
            description: 'ATF+4 automatic transmission fluid',
            unitCost: 12.75,
            retailPrice: 24.99,
            currentStock: 0,
            minStock: 12,
            maxStock: 48,
            supplier: 'Fluid Solutions',
            location: 'C3-22',
            compatibility: ['Ford F-150', 'Dodge Ram'],
            leadTime: 1,
            status: 'out_of_stock'
          },
          {
            id: '4',
            name: 'Spark Plugs (Set of 4)',
            partNumber: 'SP-44444',
            category: 'engine',
            brand: 'NGK',
            description: 'Iridium spark plugs - set of 4',
            unitCost: 32.00,
            retailPrice: 69.99,
            currentStock: 15,
            minStock: 8,
            maxStock: 40,
            supplier: 'Engine Parts Co',
            location: 'A3-05',
            compatibility: ['Toyota Camry', 'Honda Accord', 'Nissan Altima'],
            lastOrdered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            leadTime: 2,
            status: 'in_stock',
            weight: 0.5
          },
          {
            id: '5',
            name: 'Air Filter',
            partNumber: 'AF-55555',
            category: 'filters',
            brand: 'K&N',
            description: 'High-performance reusable air filter',
            unitCost: 28.50,
            retailPrice: 54.99,
            currentStock: 8,
            minStock: 5,
            maxStock: 30,
            supplier: 'Filter World',
            location: 'A1-22',
            compatibility: ['BMW 3 Series', 'BMW 5 Series'],
            lastOrdered: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            leadTime: 3,
            status: 'in_stock',
            weight: 1.2
          },
        ]

        const mockSuppliers: Supplier[] = [
          {
            id: '1',
            name: 'AutoParts Direct',
            contact: 'John Manager',
            phone: '(555) 111-2222',
            email: 'orders@autopartsdirect.com',
            rating: 4.8,
            deliveryTime: '1-3 days',
            minOrder: 100,
            activeOrders: 2,
            totalSpent: 15420.50
          },
          {
            id: '2',
            name: 'Brake Masters',
            contact: 'Sarah Wilson',
            phone: '(555) 333-4444',
            email: 'supply@brakemasters.com',
            rating: 4.6,
            deliveryTime: '2-4 days',
            minOrder: 200,
            activeOrders: 1,
            totalSpent: 8930.75
          },
          {
            id: '3',
            name: 'Engine Parts Co',
            contact: 'Mike Rodriguez',
            phone: '(555) 555-6666',
            email: 'sales@engineparts.com',
            rating: 4.9,
            deliveryTime: '1-2 days',
            minOrder: 150,
            activeOrders: 3,
            totalSpent: 22150.25
          },
        ]
        
        setParts(mockParts)
        setSuppliers(mockSuppliers)
      } finally {
        setLoading(false)
      }
    }

    loadPartsData()
  }, [])

  // Filter parts
  useEffect(() => {
    let filtered = parts

    if (searchTerm) {
      filtered = filtered.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.compatibility.some(vehicle => 
          vehicle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(part => part.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(part => part.status === statusFilter)
    }

    setFilteredParts(filtered)
  }, [parts, searchTerm, categoryFilter, statusFilter])

  const getStatusColor = (status: AutoPart['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out_of_stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'overstocked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
    }
  }

  const getStatusIcon = (status: AutoPart['status']) => {
    switch (status) {
      case 'low_stock': case 'out_of_stock': return <AlertTriangle className="h-4 w-4" />
      case 'overstocked': return <TrendingUp className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: AutoPart['category']) => {
    const colors = {
      'engine': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'transmission': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'brakes': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'suspension': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'electrical': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'body': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'interior': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'tires': 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
      'fluids': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'filters': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    return colors[category] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
  }

  const partsColumns = [
    {
      key: 'part',
      label: 'Part',
      render: (part: AutoPart) => (
        <div>
          <div className="font-medium">{part.name}</div>
          <div className="text-sm text-muted-foreground">{part.brand} • {part.partNumber}</div>
          <Badge variant="secondary" className={'mt-1 text-xs ${getCategoryColor(part.category)}'}>
            {part.category}
          </Badge>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (part: AutoPart) => (
        <div className="text-center">
          <div className="flex items-center justify-center">
            {getStatusIcon(part.status)}
            <span className="ml-1 font-medium">{part.currentStock}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Min: {part.minStock} | Max: {part.maxStock}
          </div>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (part: AutoPart) => (
        <div className="text-right">
          <div className="font-medium">${part.retailPrice.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            Cost: ${part.unitCost.toFixed(2)}
          </div>
          <div className="text-xs text-green-600">
            {Math.round(((part.retailPrice - part.unitCost) / part.unitCost) * 100)}% margin
          </div>
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (part: AutoPart) => (
        <div>
          <div className="font-medium text-sm">{part.supplier}</div>
          <div className="text-xs text-muted-foreground">
            {part.leadTime} day lead time
          </div>
          <div className="text-xs text-muted-foreground">
            Location: {part.location}
          </div>
        </div>
      ),
    },
    {
      key: 'compatibility',
      label: 'Compatibility',
      render: (part: AutoPart) => (
        <div className="text-sm">
          {part.compatibility.slice(0, 2).map((vehicle, index) => (
            <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
              {vehicle}
            </Badge>
          ))}
          {part.compatibility.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{part.compatibility.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (part: AutoPart) => (
        <Badge className={getStatusColor(part.status)}>
          {part.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (part: AutoPart) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedPart(part)}
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

  const supplierColumns = [
    {
      key: 'supplier',
      label: 'Supplier',
      render: (supplier: Supplier) => (
        <div>
          <div className="font-medium">{supplier.name}</div>
          <div className="text-sm text-muted-foreground">{supplier.contact}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div>{supplier.phone}</div>
          <div className="text-muted-foreground">{supplier.email}</div>
        </div>
      ),
    },
    {
      key: 'delivery',
      label: 'Delivery',
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div>{supplier.deliveryTime}</div>
          <div className="text-muted-foreground">Min order: ${supplier.minOrder}</div>
        </div>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (supplier: Supplier) => (
        <div className="text-sm text-center">
          <div className="font-medium">★ {supplier.rating}/5</div>
          <div className="text-muted-foreground">{supplier.activeOrders} active orders</div>
        </div>
      ),
    },
    {
      key: 'spent',
      label: 'Total Spent',
      render: (supplier: Supplier) => (
        <div className="text-right font-medium">
          ${supplier.totalSpent.toLocaleString()}
        </div>
      ),
    },
  ]

  // Summary stats
  const categories = [...new Set(parts.map(part => part.category))]
  const totalValue = parts.reduce((sum, part) => sum + (part.currentStock * part.unitCost), 0)
  const lowStockItems = parts.filter(part => part.status === 'low_stock' || part.status === 'out_of_stock').length
  const totalParts = parts.reduce((sum, part) => sum + part.currentStock, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Parts Inventory" description="Manage auto parts inventory and suppliers" />
        <div className="text-center py-8">Loading parts inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Parts Inventory" description="Manage auto parts inventory and suppliers">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Inventory</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{totalParts} total parts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Low Stock Alert</p>
              <p className="text-2xl font-bold">{lowStockItems}</p>
              <p className="text-xs text-muted-foreground">Parts need reordering</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Part categories</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
              <Truck className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
              <p className="text-xs text-muted-foreground">Active suppliers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Parts Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parts, brands, or part numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="overstocked">Overstocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            data={filteredParts}
            columns={partsColumns}
            onRowClick={(part) => setSelectedPart(part)}
            emptyState="No parts found matching your criteria"
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage supplier relationships and performance
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          <DataTable
            data={suppliers}
            columns={supplierColumns}
            emptyState="No suppliers found"
          />
        </TabsContent>
      </Tabs>

      {/* Part Details Panel */}
      {selectedPart && (
        <div className="fixed inset-0 bg-neutral-950 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPart.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedPart.brand} • Part #{selectedPart.partNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(selectedPart.category)}>
                    {selectedPart.category}
                  </Badge>
                  <Badge className={getStatusColor(selectedPart.status)}>
                    {selectedPart.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPart(null)}>
                    ×
                  </Button>
                </div>
              </div>

              {/* Part Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedPart.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Stock Information</h4>
                    <div className="space-y-1 text-sm mt-1">
                      <div className="flex justify-between">
                        <span>Current Stock:</span>
                        <span className="font-medium">{selectedPart.currentStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Stock:</span>
                        <span>{selectedPart.minStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Stock:</span>
                        <span>{selectedPart.maxStock}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Pricing</h4>
                    <div className="space-y-1 text-sm mt-1">
                      <div className="flex justify-between">
                        <span>Unit Cost:</span>
                        <span className="font-medium">${selectedPart.unitCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retail Price:</span>
                        <span className="font-medium">${selectedPart.retailPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin:</span>
                        <span className="text-green-600 font-medium">
                          {Math.round(((selectedPart.retailPrice - selectedPart.unitCost) / selectedPart.unitCost) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Supplier Information</h4>
                  <div className="space-y-1 text-sm mt-1">
                    <div className="flex justify-between">
                      <span>Supplier:</span>
                      <span className="font-medium">{selectedPart.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span>{selectedPart.leadTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{selectedPart.location}</span>
                    </div>
                    {selectedPart.lastOrdered && (
                      <div className="flex justify-between">
                        <span>Last Ordered:</span>
                        <span>{selectedPart.lastOrdered.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPart.compatibility && selectedPart.compatibility.length > 0 && (
                  <div>
                    <h4 className="font-medium">Vehicle Compatibility</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPart.compatibility.map((vehicle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {vehicle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPart.dimensions && (
                  <div>
                    <h4 className="font-medium">Physical Properties</h4>
                    <div className="space-y-1 text-sm mt-1">
                      <div className="flex justify-between">
                        <span>Dimensions (L×W×H):</span>
                        <span>
                          {selectedPart.dimensions.length}" × {selectedPart.dimensions.width}" × {selectedPart.dimensions.height}""
                        </span>
                      </div>
                      {selectedPart.weight && (
                        <div className="flex justify-between">
                          <span>Weight:</span>
                          <span>{selectedPart.weight} lbs</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button className="flex-1">Edit Part</Button>
                <Button variant="outline">Order More</Button>
                <Button variant="outline" onClick={() => setSelectedPart(null)}>
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
