"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Home, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Camera,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  Building2,
  Users
} from 'lucide-react';

export default function RealEstateListings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Mock listings data
  const listings = [
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
      images: 12,
      description: "Stunning luxury home with ocean views and modern amenities",
      features: ["Pool", "Garden", "Garage", "Smart Home"],
      openHouse: "2024-01-20T14:00:00Z"
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
      images: 18,
      description: "Beachfront property with panoramic ocean views",
      features: ["Beach Access", "Pool", "Wine Cellar", "Home Theater"],
      openHouse: null
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
      images: 8,
      description: "Modern downtown condo with city views",
      features: ["Gym", "Pool", "Concierge", "Parking"],
      openHouse: "2024-01-22T15:00:00Z"
    },
    {
      id: "L-004",
      address: "321 Hillside Blvd, Hollywood, CA",
      price: 1200000,
      type: "Townhouse",
      status: "Active",
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2200,
      daysOnMarket: 18,
      views: 167,
      favorites: 19,
      agent: "David Wilson",
      images: 15,
      description: "Charming townhouse in prime Hollywood location",
      features: ["Garden", "Garage", "Fireplace", "Balcony"],
      openHouse: "2024-01-21T13:00:00Z"
    },
    {
      id: "L-005",
      address: "654 Valley Road, Studio City, CA",
      price: 1950000,
      type: "Single Family",
      status: "Sold",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3200,
      daysOnMarket: 45,
      views: 298,
      favorites: 42,
      agent: "Sarah Johnson",
      images: 20,
      description: "Family home in quiet neighborhood with great schools",
      features: ["Pool", "Garden", "Garage", "Fireplace"],
      openHouse: null
    }
  ];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || listing.status === selectedStatus;
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-red-100 text-red-800';
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

  const getTotalListings = () => listings.length;
  const getActiveListings = () => listings.filter(l => l.status === 'Active').length;
  const getTotalValue = () => listings.reduce((total, l) => total + l.price, 0);
  const getAveragePrice = () => getTotalValue() / listings.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-gray-600 mt-1">Manage your real estate listings and properties</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Photo Upload
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
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
            <div className="text-2xl font-bold">{getTotalListings()}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveListings()} active listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalValue())}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(getAveragePrice())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.reduce((total, l) => total + l.views, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.reduce((total, l) => total + l.favorites, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Saved by potential buyers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by address or agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
                <option value="Expired">Expired</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Luxury Home">Luxury Home</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-3 left-3">
                <Badge className={getStatusColor(listing.status)}>
                  {listing.status}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 flex space-x-2">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg mb-1">{listing.address}</h3>
                  <p className="text-sm text-gray-600">{listing.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(listing.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft.toLocaleString()} sqft
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Agent: {listing.agent}</span>
                  <span>{listing.daysOnMarket} days on market</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{listing.favorites}</span>
                    </span>
                  </div>
                  <Badge variant="outline">{listing.type}</Badge>
                </div>

                {listing.openHouse && (
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>Open House: {new Date(listing.openHouse).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
