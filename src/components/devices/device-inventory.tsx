'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Download,
  Upload,
  MoreHorizontal,
  Smartphone,
  Wifi,
  Camera,
  Shield,
  Activity,
  Zap,
  MapPin,
  Thermometer
} from 'lucide-react'

// Enhanced device data with more details for inventory management
const generateInventoryData = () => {
  const deviceCategories = [
    { category: 'Security', types: ['Security Camera', 'Smart Lock', 'Motion Sensor'], icon: Shield, color: 'text-green-400' },
    { category: 'Climate', types: ['Smart Thermostat', 'Temperature Sensor', 'Humidity Sensor'], icon: Thermometer, color: 'text-blue-400' },
    { category: 'Networking', types: ['WiFi Access Point', 'Network Switch', 'Router'], icon: Wifi, color: 'text-cyan-400' },
    { category: 'POS', types: ['POS Terminal', 'Card Reader', 'Receipt Printer'], icon: Smartphone, color: 'text-orange-400' },
    { category: 'Automation', types: ['Smart Switch', 'Garage Door Controller', 'Smart Outlet'], icon: Zap, color: 'text-yellow-400' },
    { category: 'Tracking', types: ['Vehicle Tracker', 'Asset Tag', 'GPS Beacon'], icon: MapPin, color: 'text-red-400' },
    { category: 'Monitoring', types: ['Smart Sensor', 'Vibration Monitor', 'Sound Detector'], icon: Activity, color: 'text-pink-400' }
  ]

  const manufacturers = ['Thorbis IoT', 'TechCorp', 'SmartDevices Inc', 'IoT Solutions', 'ConnectedTech', 'DeviceWorks']
  const statuses = ['Active', 'Inactive', 'Maintenance', 'Retired']
  const locations = ['Building A', 'Building B', 'Warehouse', 'Mobile Unit', 'Service Van 1', 'Service Van 2', 'Main Office']

  return Array.from({ length: 50 }, (_, i) => {
    const category = deviceCategories[Math.floor(Math.random() * deviceCategories.length)]
    const deviceType = category.types[Math.floor(Math.random() * category.types.length)]
    
    return {
      id: 'INV-${String(i + 1).padStart(4, '0')}`,
      name: `${deviceType} ${i + 1}`,
      type: deviceType,
      category: category.category,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      model: `Model-${Math.floor(Math.random() * 1000) + 100}`,
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}',
      firmwareVersion: 'v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Random date within 3 years
      warrantyExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 2), // Random date within 2 years
      cost: Math.floor(Math.random() * 1000) + 50,
      lastMaintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
      icon: category.icon,
      color: category.color
    }
  })
}

export function DeviceInventory() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDevices(generateInventoryData())
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort devices
  const filteredDevices = devices
    .filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || device.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      const multiplier = sortOrder === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier
      }
      if (aValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * multiplier
      }
      return (aValue - bValue) * multiplier
    })

  const categories = [...new Set(devices.map(d => d.category))]
  const statuses = [...new Set(devices.map(d => d.status))]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Inactive':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'Maintenance':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Retired':
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
      default:
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search devices, models, or serial numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="status">Sort by Status</option>
              <option value="purchaseDate">Sort by Purchase Date</option>
              <option value="cost">Sort by Cost</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white hover:bg-neutral-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Device</span>
            </button>
            
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <p className="text-neutral-400 text-sm">Total Devices</p>
          <p className="text-2xl font-bold text-white">{devices.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <p className="text-neutral-400 text-sm">Active Devices</p>
          <p className="text-2xl font-bold text-green-400">{devices.filter(d => d.status === 'Active`).length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <p className="text-neutral-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-white">${devices.reduce((sum, d) => sum + d.cost, 0).toLocaleString()}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <p className="text-neutral-400 text-sm">Categories</p>
          <p className="text-2xl font-bold text-white">{categories.length}</p>
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800 border-b border-neutral-700">
              <tr>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Device</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Category</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Location</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Serial Number</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Purchase Date</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Cost</th>
                <th className="text-left py-4 px-6 text-neutral-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredDevices.map((device) => {
                const Icon = device.icon
                return (
                  <tr key={device.id} className="hover:bg-neutral-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          <Icon className={`h-5 w-5 ${device.color}'} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{device.name}</p>
                          <p className="text-sm text-neutral-400">{device.manufacturer} {device.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-sm">
                        {device.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}'}>
                        {device.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white">{device.location}</td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-neutral-800 px-2 py-1 rounded text-neutral-300">
                        {device.serialNumber}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-white">{device.purchaseDate.toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-white">${device.cost.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-neutral-400 hover:text-white" />
                        </button>
                        <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4 text-neutral-400 hover:text-red-400" />
                        </button>
                        <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-neutral-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No devices found</h3>
            <p className="text-neutral-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredDevices.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-neutral-400">
            Showing {filteredDevices.length} of {devices.length} devices
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors">
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">1</span>
            <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}