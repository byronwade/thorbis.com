'use client'

import { useState } from 'react'
import { 
  Plus, 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp, 
  Activity, 
  Clock, 
  Wrench, 
  Utensils, 
  Car, 
  Store, 
  Search,
  MoreVertical,
  ArrowRight,
  Eye,
  Settings,
  Edit,
  Briefcase,
  Filter,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

// Business card component with proper admin panel navigation
function BusinessCard({ business }: { business: any }) {
  const industryIcons = {
    hs: Wrench,
    auto: Car,
    rest: Utensils,
    ret: Store,
    general: Briefcase
  }

  const industryColors = {
    hs: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    auto: 'bg-green-500/20 text-green-400 border-green-500/30',
    rest: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    ret: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    general: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
  }

  const industryLabels = {
    hs: 'Home Services',
    auto: 'Automotive',
    rest: 'Restaurant',
    ret: 'Retail',
    general: 'General'
  }

  const Icon = industryIcons[business.industry] || Briefcase

  // Navigate to the industry-specific admin panel in the (verticals) route group
  const adminPanelUrl = `/dashboards/${business.industry}'

  return (
    <Card className="bg-neutral-900/50 border-neutral-700/50 hover:bg-neutral-800/50 transition-all duration-200 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={'flex h-12 w-12 items-center justify-center rounded-xl border ${industryColors[business.industry] || industryColors.general}'}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-neutral-100 text-lg group-hover:text-white transition-colors">
                {business.name}
              </CardTitle>
              <CardDescription className="text-neutral-400 text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {business.location}
              </CardDescription>
              <Badge variant="outline" className="mt-2 text-xs">
                {industryLabels[business.industry]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={business.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {business.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-700/50">
                  <MoreVertical className="h-4 w-4 text-neutral-400 hover:text-neutral-100" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={adminPanelUrl}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Business
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400">
                  Delete Business
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-neutral-100">{business.totalJobs}</div>
            <div className="text-xs text-neutral-400">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-neutral-100">${business.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-neutral-400">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-neutral-100">{business.teamSize}</div>
            <div className="text-xs text-neutral-400">Team</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Activity className="h-3 w-3" />
            Last active: {business.lastActive}
          </div>
          <Link href={adminPanelUrl}>
            <Button size="sm" className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white">
              Open Dashboard
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Business creation form component (inline, no overlay)
function CreateBusinessForm({ onSubmit, onCancel }: { onSubmit: (business: unknown) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: ',
    location: ',
    industry: ',
    description: '
  })

  const industryOptions = [
    { value: 'hs', label: 'Home Services', description: 'Plumbing, HVAC, electrical, etc.' },
    { value: 'auto', label: 'Automotive', description: 'Auto repair, dealerships, etc.' },
    { value: 'rest', label: 'Restaurant', description: 'Restaurants, cafes, food service' },
    { value: 'ret', label: 'Retail', description: 'Stores, boutiques, e-commerce' },
    { value: 'investigations', label: 'Investigations', description: 'Private investigation services' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.location && formData.industry) {
      const newBusiness = {
        id: Date.now().toString(),
        name: formData.name,
        location: formData.location,
        industry: formData.industry,
        status: 'active',
        totalJobs: 0,
        totalRevenue: 0,
        teamSize: 1,
        lastActive: 'Just created'
      }
      onSubmit(newBusiness)
    }
  }

  return (
    <Card className="bg-neutral-900/70 border-blue-500/30 shadow-lg shadow-blue-500/10">
      <CardHeader>
        <CardTitle className="text-neutral-100 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Business
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Set up a new business to start managing your operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Business Name</label>
              <Input
                placeholder="Enter business name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-200">Location</label>
              <Input
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">Industry</label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-neutral-100 focus:bg-neutral-700">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-neutral-400">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200">Description (Optional)</label>
            <Input
              placeholder="Brief description of your business"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              disabled={!formData.name || !formData.location || !formData.industry}
            >
              Create Business
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Mock data
const mockBusinesses = [
  {
    id: "1",
    name: "ProFix Plumbing",
    location: "San Francisco, CA",
    industry: "hs",
    status: "active",
    totalJobs: 147,
    totalRevenue: 89500,
    teamSize: 8,
    lastActive: "2 hours ago"
  },
  {
    id: "2", 
    name: "Downtown Bistro",
    location: "New York, NY",
    industry: "rest",
    status: "active",
    totalJobs: 0,
    totalRevenue: 125000,
    teamSize: 12,
    lastActive: "5 minutes ago"
  },
  {
    id: "3",
    name: "QuickLube Pro",
    location: "Austin, TX", 
    industry: "auto",
    status: "inactive",
    totalJobs: 89,
    totalRevenue: 45200,
    teamSize: 5,
    lastActive: "3 days ago"
  }
]

export default function DashboardsPage() {
  const [businesses, setBusinesses] = useState(mockBusinesses)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateBusiness = (newBusiness: unknown) => {
    setBusinesses(prev => [...prev, newBusiness])
    setShowCreateForm(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Business Central</h1>
          <p className="text-lg text-neutral-400">Manage and monitor all your businesses from one central hub.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Add Business'}
          </Button>
        </div>
      </div>

      {/* Create Business Form (inline) */}
      {showCreateForm && (
        <div className="mb-8">
          <CreateBusinessForm 
            onSubmit={handleCreateBusiness}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900/50 border-neutral-700/50 hover:bg-neutral-800/30 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-100 mb-1">{businesses.length}</div>
            <p className="text-xs text-neutral-500">Across all industries</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-700/50 hover:bg-neutral-800/30 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-100 mb-1">
              ${businesses.reduce((sum, b) => sum + b.totalRevenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-400">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-700/50 hover:bg-neutral-800/30 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-100 mb-1">
              {businesses.reduce((sum, b) => sum + b.teamSize, 0)}
            </div>
            <p className="text-xs text-neutral-500">Across all businesses</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-700/50 hover:bg-neutral-800/30 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-100 mb-1">
              {businesses.reduce((sum, b) => sum + b.totalJobs, 0)}
            </div>
            <p className="text-xs text-blue-400">23 completed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Management Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-neutral-100">Your Businesses</h2>
            <Badge variant="outline" className="text-neutral-400">
              {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search businesses..."
                className="pl-10 w-64 bg-neutral-800/50 border-neutral-700 text-neutral-100 placeholder-neutral-400"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-neutral-800/50 border-neutral-700 text-neutral-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="all" className="text-neutral-100">All Industries</SelectItem>
                <SelectItem value="hs" className="text-neutral-100">Home Services</SelectItem>
                <SelectItem value="auto" className="text-neutral-100">Automotive</SelectItem>
                <SelectItem value="rest" className="text-neutral-100">Restaurant</SelectItem>
                <SelectItem value="ret" className="text-neutral-100">Retail</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  View
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-800 border-neutral-700">
                <DropdownMenuItem className="text-neutral-100 focus:bg-neutral-700">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem className="text-neutral-100 focus:bg-neutral-700">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Business Grid/List */}
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <Card className="bg-neutral-900/30 border-neutral-700/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/50 mb-4">
                <Building2 className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-medium text-neutral-100 mb-2">No businesses yet</h3>
              <p className="text-neutral-400 text-center mb-6 max-w-md">
                Get started by creating your first business. Choose from our industry templates or start from scratch.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Business
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-neutral-900/50 border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New job created", business: "ProFix Plumbing", time: "2 hours ago", type: "job" },
                { action: "Payment received", business: "Downtown Bistro", time: "4 hours ago", type: "payment" },
                { action: "Team member added", business: "ProFix Plumbing", time: "1 day ago", type: "team" },
                { action: "Invoice sent", business: "QuickLube Pro", time: "2 days ago", type: "invoice" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800">
                    {activity.type === 'job' && <Wrench className="h-4 w-4 text-blue-400" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-400" />}
                    {activity.type === 'team' && <Users className="h-4 w-4 text-purple-400" />}
                    {activity.type === 'invoice' && <Calendar className="h-4 w-4 text-orange-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-100">{activity.action}</p>
                    <p className="text-xs text-neutral-400">{activity.business} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/50 border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Revenue Growth</span>
                <span className="text-sm font-medium text-green-400">+12.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Customer Satisfaction</span>
                <span className="text-sm font-medium text-blue-400">4.8/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Job Completion Rate</span>
                <span className="text-sm font-medium text-green-400">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Response Time</span>
                <span className="text-sm font-medium text-blue-400">{'< 2 hours'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}