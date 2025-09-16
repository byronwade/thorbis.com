import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Flame,
  Timer,
  ArrowRight
} from 'lucide-react'


interface KitchenTicket {
  id: string
  ticketNumber: string
  checkId: string
  tableNumber: string
  serverName: string
  
  // Items for kitchen
  items: Array<{
    id: string
    name: string
    quantity: number
    modifications: string[]
    specialInstructions?: string
    status: 'pending' | 'preparing' | 'ready' | 'served'
    station?: string
    cookTime: number
  }>
  
  // Overall ticket info
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Timing
  orderedAt: string
  estimatedReadyTime?: string
  actualReadyTime?: string
  
  // Kitchen assignment
  primaryStation: string
  assignedCook?: string
  
  // Special flags
  rush: boolean
  allergy: boolean
  modification: boolean
  
  // Party info
  partySize: number
}

const statusColors = {
  pending: 'bg-neutral-100 border-neutral-300 text-neutral-800',
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  preparing: 'bg-orange-100 border-orange-300 text-orange-800',
  ready: 'bg-green-100 border-green-300 text-green-800',
  served: 'bg-neutral-50 border-neutral-200 text-neutral-600',
  cancelled: 'bg-red-100 border-red-300 text-red-800'
}

const priorityColors = {
  low: 'text-neutral-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
}

export default function KDSPage() {
  const [tickets, setTickets] = useState<KitchenTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<string>('all')

  const stations = ['all', 'cold', 'hot', 'grill', 'fryer', 'saute', 'oven']

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      // Mock kitchen tickets data
      setTickets([
        {
          id: '1',
          ticketNumber: 'T001',
          checkId: 'check1',
          tableNumber: '12',
          serverName: 'Sarah',
          partySize: 4,
          status: 'preparing',
          priority: 'normal',
          orderedAt: '2024-01-15T19:15:00Z',
          estimatedReadyTime: '2024-01-15T19:30:00Z',
          primaryStation: 'grill',
          rush: false,
          allergy: true,
          modification: false,
          items: [
            {
              id: '1',
              name: 'Grilled Salmon',
              quantity: 2,
              modifications: ['No sauce'],
              status: 'preparing',
              station: 'grill',
              cookTime: 12
            },
            {
              id: '2', 
              name: 'Caesar Salad',
              quantity: 1,
              modifications: [],
              status: 'ready',
              station: 'cold',
              cookTime: 5
            }
          ]
        },
        {
          id: '2',
          ticketNumber: 'T002',
          checkId: 'check2',
          tableNumber: '8',
          serverName: 'Mike',
          partySize: 2,
          status: 'pending',
          priority: 'high',
          orderedAt: '2024-01-15T19:20:00Z',
          primaryStation: 'hot',
          rush: true,
          allergy: false,
          modification: true,
          items: [
            {
              id: '3',
              name: 'Chicken Wings',
              quantity: 1,
              modifications: ['Extra spicy', 'Ranch on side'],
              specialInstructions: 'Customer has nut allergy',
              status: 'pending',
              station: 'fryer',
              cookTime: 10
            }
          ]
        }
      ])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = (ticketId: string, newStatus: KitchenTicket['status']) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus }
          : ticket
      )
    )
    console.log('Update ticket status:', ticketId, newStatus)
  }

  const updateItemStatus = (ticketId: string, itemId: string, newStatus: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? {
              ...ticket,
              items: ticket.items.map(item =>
                item.id === itemId ? { ...item, status: newStatus as any } : item
              )
            }
          : ticket
      )
    )
    console.log('Update item status:', itemId, newStatus)
  }

  const filteredTickets = tickets.filter(ticket => 
    selectedStation === 'all' || 
    ticket.primaryStation === selectedStation ||
    ticket.items.some(item => item.station === selectedStation)
  )

  const getTimeElapsed = (orderedAt: string) => {
    const now = new Date()
    const ordered = new Date(orderedAt)
    const minutes = Math.floor((now.getTime() - ordered.getTime()) / (1000 * 60))
    return minutes
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900 text-white">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-sm text-neutral-400">
              {filteredTickets.length} active tickets
            </p>
          </div>
          <div className="text-lg font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Station Filters */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-3">
        <div className="flex items-center space-x-2">
          {stations.map((station) => (
            <Button
              key={station}
              variant={selectedStation === station ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStation(station)}
              className="capitalize"
            >
              {station === 'all' ? 'All Stations' : station}
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 p-6 overflow-auto">
        {filteredTickets.length === 0 ? (
          <div className="text-center text-neutral-400 py-12">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-xl">All caught up!</p>
            <p className="text-sm">No pending orders for this station</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTickets.map((ticket) => {
              const timeElapsed = getTimeElapsed(ticket.orderedAt)
              const isOverdue = timeElapsed > 20
              const isDueSoon = timeElapsed > 15
              
              return (
                <div
                  key={ticket.id}
                  className={'rounded-lg border-2 p-4 transition-all ${statusColors[ticket.status]} ${
                    isOverdue ? 'border-red-500 animate-pulse' : isDueSoon ? 'border-yellow-500' : '
              }'}
                >
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-lg">{ticket.ticketNumber}</div>
                      <div className="text-sm opacity-75">
                        Table {ticket.tableNumber} · {ticket.serverName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">
                        {timeElapsed}m
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="text-xs">{ticket.partySize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Flags */}
                  {(ticket.rush || ticket.allergy || ticket.modification) && (
                    <div className="flex items-center space-x-2 mb-3">
                      {ticket.rush && (
                        <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded text-xs">
                          <Flame className="h-3 w-3 mr-1" />
                          RUSH
                        </div>
                      )}
                      {ticket.allergy && (
                        <div className="flex items-center bg-orange-500 text-white px-2 py-1 rounded text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          ALLERGY
                        </div>
                      )}
                      {ticket.modification && (
                        <div className="flex items-center bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          MOD
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 mb-4">
                    {ticket.items.map((item) => (
                      <div key={item.id} className="bg-white/10 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {item.quantity}x {item.name}
                            </div>
                            {item.modifications.length > 0 && (
                              <div className="text-xs opacity-75 mt-1">
                                {item.modifications.join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-xs text-yellow-300 mt-1 font-medium">
                                {item.specialInstructions}
                              </div>
                            )}
                          </div>
                          <div className="text-xs">
                            <div className={'px-2 py-1 rounded ${
                              item.status === 'ready' ? 'bg-green-500' :
                              item.status === 'preparing' ? 'bg-orange-500' :
                              `bg-neutral-500'} text-white'}>'
                              {item.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {ticket.status === 'pending' && (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'preparing')}
                      >
                        Start Cooking
                      </Button>
                    )}
                    {ticket.status === 'preparing' && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'ready')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {ticket.status === 'ready' && (
                      <Button 
                        className="w-full bg-neutral-600 hover:bg-neutral-700" 
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'served')}
                      >
                        Mark Served
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-neutral-800 border-t border-neutral-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-neutral-500 rounded-full mr-2" />
              <span>Pending: {tickets.filter(t => t.status === 'pending').length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              <span>Preparing: {tickets.filter(t => t.status === 'preparing').length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span>Ready: {tickets.filter(t => t.status === 'ready').length}</span>
            </div>
          </div>
          <div className="text-neutral-400">
            Avg prep time: 12m
          </div>
        </div>
      </div>
    </div>
  )
}