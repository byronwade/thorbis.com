'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Users,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react'
import { 
  useAPI, 
  usePaginatedAPI, 
  useAPIMutation, 
  useRealTimeAPI,
  useCacheManager
} from '@/hooks/use-api'
import { useHomeServicesAPI } from '@/hooks/use-industry-api'
import { useLoading } from '@/lib/store'

// Example component demonstrating comprehensive SWR usage
export function SWRExample() {
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedPage, setSelectedPage] = useState(1)
  const { isLoading, globalLoading } = useLoading()
  const { invalidate, clear, prefetch } = useCacheManager()
  const hsAPI = useHomeServicesAPI()

  // Basic API usage
  const { 
    data: userProfile, 
    error: profileError, 
    isLoading: profileLoading,
    refresh: refreshProfile 
  } = useAPI('/api/user/profile')

  // Paginated data
  const {
    data: customers,
    error: customersError,
    isLoading: customersLoading,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    totalPages,
    currentPage
  } = usePaginatedAPI('/api/customers', selectedPage, 10, {
    params: { search: searchTerm },
    enabled: searchTerm.length >= 2 || searchTerm.length === 0
  })

  // Real-time data
  const { 
    data: liveStats, 
    isLoading: statsLoading 
  } = useRealTimeAPI('/api/dashboard/live-stats', 5000)

  // Industry-specific API
  const { 
    data: workOrders, 
    isLoading: workOrdersLoading 
  } = hsAPI.useWorkOrders(1, { status: 'in_progress' })

  // Mutations
  const { 
    trigger: createCustomer, 
    isMutating: creatingCustomer 
  } = useAPIMutation('/api/customers', 'POST', {
    onSuccess: () => {
      // Invalidate customers list after creation
      invalidate('/api/customers')
    }
  })

  const { 
    trigger: updateProfile, 
    isMutating: updatingProfile 
  } = useAPIMutation('/api/user/profile', 'PUT', {
    relatedKeys: ['/api/user/profile']
  })

  // Example handlers
  const handleCreateCustomer = async () => {
    try {
      await createCustomer({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234'
      })
    } catch (error) {
      console.error('Failed to create customer:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        name: 'Updated Name',
        preferences: { theme: 'dark' }
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handlePrefetchData = async () => {
    await prefetch('/api/v1/reports/analytics')
    console.log('Analytics data prefetched')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">SWR Implementation Demo</h2>
          <p className="text-neutral-400 mt-2">
            Comprehensive server state management with caching, revalidation, and optimistic updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={globalLoading ? 'default' : 'secondary'}>
            {globalLoading ? 'Loading...' : 'Ready'}
          </Badge>
          <Button onClick={() => clear()} variant="outline" size="sm">
            Clear Cache
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900">
          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
          <TabsTrigger value="pagination">Pagination</TabsTrigger>
          <TabsTrigger value="mutations">Mutations</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="industry">Industry API</TabsTrigger>
        </TabsList>

        {/* Basic Usage Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Basic API data fetching with automatic caching and revalidation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading profile...
                </div>
              )}
              
              {profileError && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Error: {profileError.message}
                </div>
              )}
              
              {userProfile && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Name</p>
                      <p className="text-white">{userProfile.data?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Email</p>
                      <p className="text-white">{userProfile.data?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={refreshProfile} size="sm" disabled={profileLoading}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleUpdateProfile} 
                      size="sm" 
                      disabled={updatingProfile}
                    >
                      {updatingProfile ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Update Profile
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pagination Tab */}
        <TabsContent value="pagination" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5" />
                Customer Management
              </CardTitle>
              <CardDescription>
                Paginated data with search and filtering capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <Button onClick={handleCreateCustomer} disabled={creatingCustomer}>
                  {creatingCustomer ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Add Customer
                </Button>
              </div>

              {customersLoading && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading customers...
                </div>
              )}

              {customersError && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Error: {customersError.message}
                </div>
              )}

              {customers && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-neutral-400">
                    <span>Showing {customers.data?.length || 0} of {totalItems} customers</span>
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>

                  <div className="space-y-2">
                    {customers.data?.map((customer: unknown) => (
                      <div key={customer.id} className="p-3 bg-neutral-950 rounded border border-neutral-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{customer.name}</h4>
                            <p className="text-sm text-neutral-400">{customer.email}</p>
                          </div>
                          <Badge variant="outline">
                            ${customer.totalSpent?.toFixed(2) || '0.00'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setSelectedPage(currentPage - 1)}
                      disabled={!hasPreviousPage || customersLoading}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-neutral-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setSelectedPage(currentPage + 1)}
                      disabled={!hasNextPage || customersLoading}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mutations Tab */}
        <TabsContent value="mutations" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                Data Mutations
              </CardTitle>
              <CardDescription>
                Create, update, and delete operations with optimistic updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-950 rounded border border-neutral-800">
                  <h4 className="font-medium text-white mb-2">Create Customer</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Creates a new customer with automatic cache invalidation
                  </p>
                  <Button 
                    onClick={handleCreateCustomer} 
                    disabled={creatingCustomer}
                    className="w-full"
                  >
                    {creatingCustomer ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Create Customer
                  </Button>
                </div>

                <div className="p-4 bg-neutral-950 rounded border border-neutral-800">
                  <h4 className="font-medium text-white mb-2">Update Profile</h4>
                  <p className="text-sm text-neutral-400 mb-4">
                    Updates user profile with optimistic UI updates
                  </p>
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={updatingProfile}
                    className="w-full"
                  >
                    {updatingProfile ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Update Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                Live Statistics
              </CardTitle>
              <CardDescription>
                Real-time data with automatic polling and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading && !liveStats && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading live stats...
                </div>
              )}

              {liveStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-center">
                    <div className="text-2xl font-bold text-white">
                      {liveStats.data?.activeUsers || 0}
                    </div>
                    <div className="text-sm text-neutral-400">Active Users</div>
                  </div>
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-center">
                    <div className="text-2xl font-bold text-white">
                      ${liveStats.data?.revenue || 0}
                    </div>
                    <div className="text-sm text-neutral-400">Revenue Today</div>
                  </div>
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-center">
                    <div className="text-2xl font-bold text-white">
                      {liveStats.data?.orders || 0}
                    </div>
                    <div className="text-sm text-neutral-400">Orders</div>
                  </div>
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-center">
                    <div className="text-2xl font-bold text-white">
                      {liveStats.data?.conversion || 0}%
                    </div>
                    <div className="text-sm text-neutral-400">Conversion</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                Updates every 5 seconds
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry API Tab */}
        <TabsContent value="industry" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5" />
                Industry-Specific APIs
              </CardTitle>
              <CardDescription>
                Home Services work orders with industry-specific data structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workOrdersLoading && (
                <div className="flex items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading work orders...
                </div>
              )}

              {workOrders && (
                <div className="space-y-3">
                  {workOrders.data?.map((order: unknown) => (
                    <div key={order.id} className="p-4 bg-neutral-950 rounded border border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">#{order.id}</h4>
                        <Badge variant={order.status === 'in_progress' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400 mb-2">{order.description}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Customer: {order.customerName}</span>
                        <span>${order.totalCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Button onClick={handlePrefetchData} variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Prefetch Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SWRExample