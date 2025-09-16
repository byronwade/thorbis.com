import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Phone,
  MessageSquare,
  Camera,
  FileText,
  Wrench,
  Star,
  Battery,
  Wifi,
  Signal,
  Menu,
  Home,
  Calendar,
  Truck,
  User,
  Settings,
  PlayCircle,
  PauseCircle,
  MapIcon,
  ClipboardList,
  DollarSign,
  Upload,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Activity
} from 'lucide-react'


interface MobileJob {
  id: string
  workOrderNumber: string
  customer: {
    name: string
    address: string
    phone: string
    email: string
  }
  service: {
    type: 'hvac' | 'plumbing' | 'electrical' | 'appliance'
    category: string
    priority: 'low' | 'medium' | 'high' | 'emergency'
    description: string
  }
  schedule: {
    date: string
    timeWindow: string
    duration: number
    arrivalTime?: string
    startTime?: string
    completionTime?: string
  }
  status: 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed' | 'cancelled'
  technician: {
    id: string
    name: string
    phone: string
    truck: string
  }
  location: {
    lat: number
    lng: number
    distance?: number
    estimatedTravelTime?: number
  }
  invoice: {
    subtotal: number
    tax: number
    total: number
    paymentMethod?: string
    paymentStatus: 'pending' | 'paid' | 'failed'
  }
  materials: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  photos: string[]
  signatures: Array<{
    type: 'customer' | 'technician'
    signedBy: string
    timestamp: string
    imageUrl: string
  }>
  notes: Array<{
    timestamp: string
    author: string
    content: string
    type: 'general' | 'issue' | 'completion'
  }>
}

export default function MobilePage() {
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [jobs, setJobs] = useState<MobileJob[]>([])
  const [todaysJobs, setTodaysJobs] = useState<MobileJob[]>([])
  const [currentJob, setCurrentJob] = useState<MobileJob | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'map' | 'inventory' | 'profile'>('dashboard')
  const [timeTracking, setTimeTracking] = useState<{
    isActive: boolean
    startTime?: Date
    jobId?: string
  }>({ isActive: false })
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online')

  useEffect(() => {
    fetchMobileData()
    initializeLocation()
    startLocationTracking()
  }, [])

  const fetchMobileData = async () => {
    try {
      // Mock comprehensive mobile field service data
      const mockJobs: MobileJob[] = [
        {
          id: 'job-001',
          workOrderNumber: 'WO-2024-001247',
          customer: {
            name: 'Jennifer Martinez',
            address: '1847 Oak Street, Springfield, IL 62701',
            phone: '(217) 555-0123',
            email: 'jennifer.martinez@email.com'
          },
          service: {
            type: 'hvac',
            category: 'AC Repair',
            priority: 'high',
            description: 'Air conditioning unit not cooling properly. Customer reports warm air from vents.'
          },
          schedule: {
            date: new Date().toISOString().split('T')[0],
            timeWindow: '9:00 AM - 11:00 AM',
            duration: 120,
            arrivalTime: '9:15 AM'
          },
          status: 'en_route',
          technician: {
            id: 'tech-001',
            name: 'Mike Rodriguez',
            phone: '(217) 555-0234',
            truck: 'HVAC-01'
          },
          location: {
            lat: 39.7817,
            lng: -89.6501,
            distance: 12.3,
            estimatedTravelTime: 18
          },
          invoice: {
            subtotal: 285.00,
            tax: 22.80,
            total: 307.80,
            paymentStatus: 'pending'
          },
          materials: [
            { id: 'mat-001', name: 'Capacitor 35µF', quantity: 1, price: 45.00 },
            { id: 'mat-002', name: 'Refrigerant R-410A (2lbs)', quantity: 2, price: 120.00 }
          ],
          photos: [],
          signatures: [],
          notes: []
        },
        {
          id: 'job-002',
          workOrderNumber: 'WO-2024-001248',
          customer: {
            name: 'Robert Wilson',
            address: '2156 Maple Avenue, Springfield, IL 62702',
            phone: '(217) 555-0345',
            email: 'robert.wilson@email.com'
          },
          service: {
            type: 'plumbing',
            category: 'Drain Cleaning',
            priority: 'medium',
            description: 'Kitchen sink draining slowly. Possible clog in main drain line.'
          },
          schedule: {
            date: new Date().toISOString().split('T')[0],
            timeWindow: '1:00 PM - 3:00 PM',
            duration: 90
          },
          status: 'scheduled',
          technician: {
            id: 'tech-001',
            name: 'Mike Rodriguez',
            phone: '(217) 555-0234',
            truck: 'HVAC-01'
          },
          location: {
            lat: 39.7817,
            lng: -89.6501,
            distance: 8.7,
            estimatedTravelTime: 12
          },
          invoice: {
            subtotal: 165.00,
            tax: 13.20,
            total: 178.20,
            paymentStatus: 'pending'
          },
          materials: [],
          photos: [],
          signatures: [],
          notes: []
        },
        {
          id: 'job-003',
          workOrderNumber: 'WO-2024-001249',
          customer: {
            name: 'Sarah Thompson',
            address: '789 Pine Street, Springfield, IL 62703',
            phone: '(217) 555-0456',
            email: 'sarah.thompson@email.com'
          },
          service: {
            type: 'electrical',
            category: 'Outlet Installation',
            priority: 'low',
            description: 'Install 3 new GFCI outlets in bathroom and kitchen areas.'
          },
          schedule: {
            date: new Date().toISOString().split('T')[0],
            timeWindow: '4:00 PM - 6:00 PM',
            duration: 180
          },
          status: 'scheduled',
          technician: {
            id: 'tech-001',
            name: 'Mike Rodriguez',
            phone: '(217) 555-0234',
            truck: 'HVAC-01'
          },
          location: {
            lat: 39.7817,
            lng: -89.6501,
            distance: 15.2,
            estimatedTravelTime: 22
          },
          invoice: {
            subtotal: 425.00,
            tax: 34.00,
            total: 459.00,
            paymentStatus: 'pending'
          },
          materials: [
            { id: 'mat-003', name: 'GFCI Outlet 20A', quantity: 3, price: 180.00 },
            { id: 'mat-004', name: '12 AWG Wire (50ft)', quantity: 1, price: 85.00 }
          ],
          photos: [],
          signatures: [],
          notes: []
        }
      ]

      const today = new Date().toISOString().split('T')[0]
      const todayJobs = mockJobs.filter(job => job.schedule.date === today)
      
      setJobs(mockJobs)
      setTodaysJobs(todayJobs)
      setCurrentJob(todayJobs.find(job => job.status === 'en_route') || todayJobs[0] || null)
    } catch (error) {
      console.error('Error fetching mobile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to default location (Springfield, IL)
          setCurrentLocation({ lat: 39.7817, lng: -89.6501 })
        }
      )
    }
  }

  const startLocationTracking = () => {
    // Simulate real-time location updates
    setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          }
        )
      }
    }, 30000) // Update every 30 seconds
  }

  const toggleTimeTracking = (jobId?: string) => {
    setTimeTracking(prev => ({
      isActive: !prev.isActive,
      startTime: !prev.isActive ? new Date() : undefined,
      jobId: jobId || prev.jobId
    }))
  }

  const updateJobStatus = (jobId: string, newStatus: MobileJob['status']) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: newStatus }
        : job
    ))
    setTodaysJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: newStatus }
        : job
    ))
  }

  const getTechnicianStats = () => {
    const completedToday = todaysJobs.filter(job => job.status === 'completed').length
    const totalRevenue = todaysJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + job.invoice.total, 0)
    const efficiency = todaysJobs.length > 0 ? (completedToday / todaysJobs.length) * 100 : 0

    return {
      completedJobs: completedToday,
      totalJobs: todaysJobs.length,
      revenue: totalRevenue,
      efficiency: Math.round(efficiency)
    }
  }

  const stats = getTechnicianStats()

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.completedJobs}</span>
          </div>
          <p className="text-sm text-neutral-400">Completed Today</p>
          <p className="text-xs text-neutral-500">{stats.totalJobs} total jobs</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">${stats.revenue.toFixed(0)}</span>
          </div>
          <p className="text-sm text-neutral-400">Revenue Today</p>
          <p className="text-xs text-neutral-500">{stats.efficiency}% efficiency</p>
        </div>
      </div>

      {/* Current Job Card */}
      {currentJob && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Job</h3>
            <div className={'px-2 py-1 rounded text-xs font-medium ${
              currentJob.status === 'en_route' ? 'bg-blue-800 text-blue-200' :
              currentJob.status === 'on_site' ? 'bg-orange-800 text-orange-200' :
              currentJob.status === 'in_progress' ? 'bg-purple-800 text-purple-200' :
              'bg-neutral-800 text-neutral-200'
              }'}>'
              {currentJob.status.replace('_', ' `).toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-white font-medium">{currentJob.customer.name}</p>
              <p className="text-sm text-neutral-400">{currentJob.customer.address}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-neutral-400">
                <Clock className="h-4 w-4 mr-1" />
                {currentJob.schedule.timeWindow}
              </div>
              <div className="flex items-center text-sm text-neutral-400">
                <MapPin className="h-4 w-4 mr-1" />
                {currentJob.location.distance?.toFixed(1)} mi
              </div>
            </div>

            <div className="bg-neutral-800/50 p-3 rounded-lg">
              <p className="text-sm text-neutral-300">{currentJob.service.description}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(`tel:${currentJob.customer.phone}')}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 bg-neutral-800 border-neutral-700"
                onClick={() => window.open('https://maps.google.com/?q=${currentJob.customer.address}')}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline"
          className="h-20 bg-neutral-900 border-neutral-800 hover:bg-neutral-800 flex-col"
          onClick={() => toggleTimeTracking(currentJob?.id)}
        >
          {timeTracking.isActive ? (
            <>
              <PauseCircle className="h-6 w-6 text-red-400 mb-1" />
              <span className="text-sm text-red-400">Stop Timer</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-6 w-6 text-green-400 mb-1" />
              <span className="text-sm text-green-400">Start Timer</span>
            </>
          )}
        </Button>

        <Button 
          variant="outline"
          className="h-20 bg-neutral-900 border-neutral-800 hover:bg-neutral-800 flex-col"
          onClick={() => setActiveTab('map')}
        >
          <MapIcon className="h-6 w-6 text-blue-400 mb-1" />
          <span className="text-sm text-neutral-300">View Map</span>
        </Button>
      </div>

      {/* Today's Schedule Preview */}'
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Today's Schedule</h3>'
        <div className="space-y-3">
          {todaysJobs.slice(0, 3).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">{job.customer.name}</p>
                <p className="text-sm text-neutral-400">{job.schedule.timeWindow}</p>
              </div>
              <div className={'w-3 h-3 rounded-full ${
                job.status === 'completed' ? 'bg-green-500' :
                job.status === 'in_progress' ? 'bg-blue-500' :
                job.status === 'en_route' ? 'bg-orange-500' : 'bg-neutral-500`
              }'}></div>'
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderJobsList = () => (
    <div className="space-y-4">
      {todaysJobs.map((job) => (
        <div key={job.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium">{job.customer.name}</p>
              <p className="text-sm text-neutral-400">{job.workOrderNumber}</p>
            </div>
            <div className={'px-3 py-1 rounded text-sm font-medium ${
              job.status === 'completed' ? 'bg-green-800 text-green-200' :
              job.status === 'in_progress' ? 'bg-blue-800 text-blue-200' :
              job.status === 'en_route' ? 'bg-orange-800 text-orange-200' :
              job.status === 'on_site' ? 'bg-purple-800 text-purple-200' :
              'bg-neutral-800 text-neutral-200'
              }'}>'
              {job.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-neutral-300">{job.customer.address}</p>
                <p className="text-sm text-neutral-400">{job.service.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {job.schedule.timeWindow}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${job.invoice.total.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-neutral-800 border-neutral-700 text-neutral-300"
                onClick={() => setCurrentJob(job)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Details
              </Button>
              {job.status === 'scheduled' && (
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => updateJobStatus(job.id, 'en_route')}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {job.status === 'en_route' && (
                <Button 
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => updateJobStatus(job.id, 'on_site')}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Arrive
                </Button>
              )}
              {job.status === 'on_site' && (
                <Button 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => updateJobStatus(job.id, 'in_progress')}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Start Work
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Mobile Header */}
      <div className="bg-neutral-925 border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white">Field Service</h1>
            {currentLocation && (
              <div className="ml-4 flex items-center text-sm text-neutral-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Springfield, IL</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={'flex items-center text-sm ${
              connectionStatus === 'online' ? 'text-green-400' : 
              connectionStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }'}>'
              {connectionStatus === 'online' ? <Wifi className="h-4 w-4" /> :
               connectionStatus === 'offline' ? <Zap className="h-4 w-4" /> : 
               <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
            <Battery className="h-4 w-4 text-neutral-400" />
            <Signal className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {timeTracking.isActive && (
          <div className="mt-2 p-2 bg-green-900/20 border border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-400">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">Timer Active</span>
              </div>
              <span className="text-sm font-mono text-green-400">
                {timeTracking.startTime && 
                  '${Math.floor((Date.now() - timeTracking.startTime.getTime()) / 60000)}:${
                    String(Math.floor(((Date.now() - timeTracking.startTime.getTime()) % 60000) / 1000)).padStart(2, '0')
                  }'}
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'jobs' && renderJobsList()}
            {activeTab === 'map' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">Interactive map view</p>
                  <p className="text-sm text-neutral-500 mt-1">Showing {todaysJobs.length} jobs</p>
                </div>
              </div>
            )}
            {activeTab === 'inventory' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Truck Inventory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-white">HVAC Capacitors</span>
                    <span className="text-green-400">24 units</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-white">R-410A Refrigerant</span>
                    <span className="text-yellow-400">3 lbs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <span className="text-white">Drain Snake Cable</span>
                    <span className="text-red-400">1 unit</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    MR
                  </div>
                  <h3 className="text-lg font-semibold text-white">Mike Rodriguez</h3>
                  <p className="text-neutral-400">Senior HVAC Technician</p>
                  <p className="text-sm text-neutral-500 mt-1">ID: TECH-001</p>
                </div>
                
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Today's Performance</h3>'
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{stats.completedJobs}</p>
                      <p className="text-sm text-neutral-400">Jobs Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{stats.efficiency}%</p>
                      <p className="text-sm text-neutral-400">Efficiency</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-neutral-925 border-t border-neutral-800 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="flex-col h-12 min-w-0"
          >
            <Home className="h-4 w-4" />
            <span className="text-xs mt-1">Dashboard</span>
          </Button>
          <Button
            variant={activeTab === 'jobs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('jobs')}
            className="flex-col h-12 min-w-0"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs mt-1">Jobs</span>
          </Button>
          <Button
            variant={activeTab === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('map')}
            className="flex-col h-12 min-w-0"
          >
            <MapIcon className="h-4 w-4" />
            <span className="text-xs mt-1">Map</span>
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('inventory')}
            className="flex-col h-12 min-w-0"
          >
            <Truck className="h-4 w-4" />
            <span className="text-xs mt-1">Inventory</span>
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="flex-col h-12 min-w-0"
          >
            <User className="h-4 w-4" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}