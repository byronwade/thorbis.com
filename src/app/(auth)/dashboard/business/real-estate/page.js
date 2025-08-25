"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  Home, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  MapPin,
  Calendar,
  Clock,
  Star,
  Eye,
  Phone,
  Mail,
  Building2,
  Target,
  Activity,
  FileText,
  Camera,
  Search,
  Heart,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function RealEstateDashboard() {
  // Mock data for real estate dashboard
  const dashboardData = {
    stats: {
      totalListings: 24,
      activeListings: 18,
      pendingSales: 6,
      totalValue: 12450000,
      averagePrice: 518750,
      totalLeads: 156,
      newLeads: 23,
      conversionRate: 12.8,
      averageDaysOnMarket: 45
    },
    recentListings: [
      {
        id: "L-001",
        address: "123 Luxury Lane, Beverly Hills, CA",
        price: 2500000,
        type: "Single Family",
        status: "Active",
        bedrooms: 5,
        bathrooms: 4,
        sqft: 4500,
        daysOnMarket: 12,
        views: 156,
        favorites: 23,
        agent: "Sarah Johnson",
        images: 12
      },
      {
        id: "L-002",
        address: "456 Ocean View Dr, Malibu, CA",
        price: 3800000,
        type: "Luxury Home",
        status: "Pending",
        bedrooms: 6,
        bathrooms: 5,
        sqft: 6200,
        daysOnMarket: 8,
        views: 89,
        favorites: 15,
        agent: "Mike Chen",
        images: 18
      },
      {
        id: "L-003",
        address: "789 Downtown Ave, Los Angeles, CA",
        price: 850000,
        type: "Condo",
        status: "Active",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        daysOnMarket: 25,
        views: 234,
        favorites: 31,
        agent: "Lisa Rodriguez",
        images: 8
      }
    ],
    topAgents: [
      {
        name: "Sarah Johnson",
        listings: 8,
        sales: 12,
        revenue: 2845000,
        rating: 4.9,
        image: "/placeholder-avatar.svg"
      },
      {
        name: "Mike Chen",
        listings: 6,
        sales: 9,
        revenue: 2150000,
        rating: 4.8,
        image: "/placeholder-avatar.svg"
      },
      {
        name: "Lisa Rodriguez",
        listings: 5,
        sales: 7,
        revenue: 1680000,
        rating: 4.7,
        image: "/placeholder-avatar.svg"
      }
    ],
    recentLeads: [
      {
        id: "LD-001",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        source: "Website",
        status: "New",
        budget: "800k-1.2M",
        preferences: "3+ beds, 2+ baths, Pool",
        assignedTo: "Sarah Johnson",
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "LD-002",
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "(555) 234-5678",
        source: "Referral",
        status: "Contacted",
        budget: "2M-3M",
        preferences: "Luxury, Ocean View, 4+ beds",
        assignedTo: "Mike Chen",
        createdAt: "2024-01-15T09:15:00Z"
      },
      {
        id: "LD-003",
        name: "Robert Wilson",
        email: "robert.wilson@email.com",
        phone: "(555) 345-6789",
        source: "Social Media",
        status: "Qualified",
        budget: "500k-750k",
        preferences: "Downtown, Modern, 2 beds",
        assignedTo: "Lisa Rodriguez",
        createdAt: "2024-01-15T08:45:00Z"
      }
    ],
    marketInsights: {
      averageDaysOnMarket: 45,
      pricePerSqft: 485,
      inventoryLevel: "Low",
      marketTrend: "Seller's Market",
      topNeighborhoods: [
        { name: "Beverly Hills", avgPrice: 2850000, sales: 8 },
        { name: "Malibu", avgPrice: 3200000, sales: 5 },
        { name: "Downtown LA", avgPrice: 750000, sales: 12 }
      ]
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real Estate Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your real estate business and listings</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/business/real_estate/listings/new">
              <Home className="w-4 h-4 mr-2" />
              Add Listing
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business/real_estate/leads">
              <Users className="w-4 h-4 mr-2" />
              Manage Leads
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.activeListings} active • {dashboardData.stats.pendingSales} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(dashboardData.stats.averagePrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.stats.newLeads} new • {dashboardData.stats.conversionRate}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days on Market</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.averageDaysOnMarket}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.marketInsights.marketTrend}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Recent Listings
              </CardTitle>
              <CardDescription>
                Latest property listings and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{listing.address}</h4>
                          <p className="text-sm text-gray-600">
                            {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft.toLocaleString()} sqft
                          </p>
                          <p className="text-sm text-gray-500">{listing.type}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                          <div className="text-lg font-bold mt-1">
                            {formatCurrency(listing.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Agent: {listing.agent}</span>
                          <span>{listing.daysOnMarket} days on market</span>
                          <span>{listing.views} views</span>
                          <span>{listing.favorites} favorites</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Camera className="w-4 h-4 mr-1" />
                            {listing.images}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/business/real_estate/listings/${listing.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/real_estate/listings">
                    View All Listings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top Agents
              </CardTitle>
              <CardDescription>
                Best performing agents this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.topAgents.map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <p className="text-xs text-gray-600">{agent.listings} listings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{agent.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatCurrency(agent.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Recent Leads
              </CardTitle>
              <CardDescription>
                Latest potential clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentLeads.map((lead) => (
                  <div key={lead.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      <Badge className={getLeadStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{lead.budget}</p>
                    <p className="text-xs text-gray-500 mb-2">{lead.preferences}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{lead.source}</span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/business/real_estate/leads">
                    View All Leads
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common real estate operations and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/real_estate/listings">
                <Home className="w-6 h-6 mb-2" />
                <span className="text-sm">Listings</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/real_estate/leads">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Leads</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/real_estate/agents">
                <Building2 className="w-6 h-6 mb-2" />
                <span className="text-sm">Agents</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/dashboard/business/real_estate/analytics">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
