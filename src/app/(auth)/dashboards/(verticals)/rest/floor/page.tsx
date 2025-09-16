import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Users,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  User,
  MoreVertical,
  Settings
} from 'lucide-react'


interface Table {
  id: string
  number: string
  name?: string
  capacity: number
  section: string
  
  // Current status
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service'
  currentCheckId?: string
  reservationId?: string
  
  // Staff assignment
  serverId?: string
  server?: {
    name: string
  }
  
  // Layout information
  location: {
    x: number
    y: number
    width: number
    height: number
  }
  shape: 'square' | 'rectangle' | 'circle' | 'oval'
  
  // Features
  features: string[]
  
  // Timing
  lastCleaned?: string
  nextReservation?: string
  
  // Current check info
  currentCheck?: {
    partySize: number
    openedAt: string
    total: number
    itemCount: number
  }
}

const statusColors = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-blue-500',
  cleaning: 'bg-yellow-500',
  out_of_service: 'bg-neutral-500'
}

const statusTextColors = {
  available: 'text-green-700 dark:text-green-300',
  occupied: 'text-red-700 dark:text-red-300',
  reserved: 'text-blue-700 dark:text-blue-300',
  cleaning: 'text-yellow-700 dark:text-yellow-300',
  out_of_service: 'text-neutral-700 dark:text-neutral-300'
}

export default function FloorPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      // Mock data for restaurant floor plan
      setTables([
        {
          id: '1',
          number: '1',
          capacity: 4,
          section: 'Main Dining',
          status: 'occupied',
          location: { x: 50, y: 50, width: 80, height: 80 },
          shape: 'square',
          features: ['window_view'],
          serverId: 'server1',
          server: { name: 'Sarah Johnson' },
          currentCheck: {
            partySize: 3,
            openedAt: '2024-01-15T18:30:00Z',
            total: 67.50,
            itemCount: 8
          }
        },
        {
          id: '2',
          number: '2',
          capacity: 2,
          section: 'Main Dining',
          status: 'available',
          location: { x: 160, y: 50, width: 60, height: 60 },
          shape: 'square',
          features: []
        },
        {
          id: '3',
          number: '3',
          capacity: 6,
          section: 'Main Dining',
          status: 'reserved',
          location: { x: 50, y: 160, width: 100, height: 80 },
          shape: 'rectangle',
          features: ['booth'],
          nextReservation: '2024-01-15T19:00:00Z'
        },
        {
          id: '4',
          number: '4',
          capacity: 4,
          section: 'Patio',
          status: 'cleaning',
          location: { x: 250, y: 50, width: 80, height: 80 },
          shape: 'circle',
          features: ['outdoor']
        }
      ])
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTableIcon = (status: Table['status']) => {
    switch (status) {
      case 'available': return CheckCircle
      case 'occupied': return Users
      case 'reserved': return Clock
      case 'cleaning': return AlertTriangle
      case 'out_of_service': return Circle
      default: return Circle
    }
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    console.log('Selected table:', table.id)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Floor Plan</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Monitor table status and manage seating
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="header" className="rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              Layout
            </Button>
            <Button variant="header" className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>
        </div>
      </div>

      {/* Floor Plan Content */}
      <div className="flex-1 flex">
        {/* Floor Plan Visual */}
        <div className="flex-1 p-6">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg h-full relative min-h-[600px] border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            {/* Section Labels */}
            <div className="absolute top-4 left-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Main Dining
            </div>
            <div className="absolute top-4 right-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Patio
            </div>
            
            {/* Tables */}
            {tables.map((table) => {
              const Icon = getTableIcon(table.status)
              
              return (
                <div
                  key={table.id}
                  className={cn(
                    "absolute cursor-pointer rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg",
                    "bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600",
                    "flex flex-col items-center justify-center text-center p-2",
                    selectedTable?.id === table.id && "ring-2 ring-blue-500"
                  )}
                  style={{
                    left: table.location.x,
                    top: table.location.y,
                    width: table.location.width,
                    height: table.location.height,
                    borderRadius: table.shape === 'circle' ? '50%' : table.shape === 'oval' ? '40px' : '8px'
                  }}
                  onClick={() => handleTableClick(table)}
                >
                  {/* Status indicator */}
                  <div className={'w-3 h-3 rounded-full ${statusColors[table.status]} mb-1'} />
                  
                  {/* Table number */}
                  <div className="font-bold text-sm">#{table.number}</div>
                  
                  {/* Capacity */}
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {table.capacity}
                  </div>
                  
                  {/* Current status info */}
                  {table.status === 'occupied' && table.currentCheck && (
                    <div className="text-xs text-center mt-1">
                      <div className="font-medium">${table.currentCheck.total.toFixed(2)}</div>
                      <div className="text-muted-foreground">{table.currentCheck.itemCount} items</div>
                    </div>
                  )}
                  
                  {table.status === 'reserved' && table.nextReservation && (
                    <div className="text-xs text-center mt-1">
                      <div className="text-blue-600 dark:text-blue-400">
                        {new Date(table.nextReservation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit` })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Table Details Sidebar */}
        <div className="w-80 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Table Details</h3>
            
            {selectedTable ? (
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">Table {selectedTable.number}</div>
                  <div className="text-sm text-muted-foreground">{selectedTable.section}</div>
                </div>
                
                <div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusTextColors[selectedTable.status]}'}>
                    <div className={'w-2 h-2 rounded-full ${statusColors[selectedTable.status]} mr-2'} />
                    {selectedTable.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Capacity</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedTable.capacity} guests
                  </div>
                </div>
                
                {selectedTable.server && (
                  <div>
                    <div className="text-sm font-medium">Assigned Server</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedTable.server.name}
                    </div>
                  </div>
                )}
                
                {selectedTable.currentCheck && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Current Check</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Party Size:</span>
                        <span>{selectedTable.currentCheck.partySize}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span>{selectedTable.currentCheck.itemCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-medium">${selectedTable.currentCheck.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span>{Math.round((new Date().getTime() - new Date(selectedTable.currentCheck.openedAt).getTime()) / (1000 * 60))}m</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTable.features.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Features</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTable.features.map((feature) => (
                        <span 
                          key={feature}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Table
                  </Button>
                  {selectedTable.status === 'available' && (
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Seat Guests
                    </Button>
                  )}
                  {selectedTable.status === 'occupied' && (
                    <Button variant="outline" className="w-full" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Close Check
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <p>Click on a table to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Legend */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center">
                <div className={'w-3 h-3 rounded-full ${color} mr-2'} />
                <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {tables.filter(t => t.status === 'occupied').length} / {tables.length} tables occupied
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}