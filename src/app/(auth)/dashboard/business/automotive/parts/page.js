"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  Building2,
  Edit,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function AutomotivePartsInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Mock data for parts inventory
  const partsInventory = [
    {
      id: "P-001",
      name: "Brake Pads - Front",
      category: "Brakes",
      brand: "Brembo",
      partNumber: "BP-F-001",
      description: "Premium ceramic brake pads for front wheels",
      quantity: 2,
      minQuantity: 5,
      maxQuantity: 20,
      unitCost: 45.99,
      retailPrice: 89.99,
      supplier: "AutoZone",
      supplierContact: "(555) 123-4567",
      lastRestocked: "2024-01-10T10:30:00Z",
      nextRestock: "2024-01-20T10:30:00Z",
      location: "Shelf A-1",
      status: "low_stock"
    },
    {
      id: "P-002",
      name: "Oil Filter - Premium",
      category: "Filters",
      brand: "Mobil 1",
      partNumber: "OF-P-002",
      description: "High-performance oil filter for synthetic oils",
      quantity: 0,
      minQuantity: 10,
      maxQuantity: 50,
      unitCost: 8.99,
      retailPrice: 15.99,
      supplier: "NAPA",
      supplierContact: "(555) 234-5678",
      lastRestocked: "2024-01-08T14:15:00Z",
      nextRestock: "2024-01-18T14:15:00Z",
      location: "Shelf B-3",
      status: "out_of_stock"
    },
    {
      id: "P-003",
      name: "Air Filter - Engine",
      category: "Filters",
      brand: "K&N",
      partNumber: "AF-E-003",
      description: "High-flow air filter for improved performance",
      quantity: 15,
      minQuantity: 5,
      maxQuantity: 25,
      unitCost: 25.99,
      retailPrice: 49.99,
      supplier: "AutoZone",
      supplierContact: "(555) 123-4567",
      lastRestocked: "2024-01-12T09:45:00Z",
      nextRestock: "2024-01-22T09:45:00Z",
      location: "Shelf B-1",
      status: "in_stock"
    },
    {
      id: "P-004",
      name: "Spark Plugs - Iridium",
      category: "Ignition",
      brand: "NGK",
      partNumber: "SP-I-004",
      description: "Iridium spark plugs for optimal performance",
      quantity: 8,
      minQuantity: 10,
      maxQuantity: 30,
      unitCost: 12.99,
      retailPrice: 24.99,
      supplier: "NAPA",
      supplierContact: "(555) 234-5678",
      lastRestocked: "2024-01-11T11:20:00Z",
      nextRestock: "2024-01-21T11:20:00Z",
      location: "Shelf C-2",
      status: "low_stock"
    },
    {
      id: "P-005",
      name: "Battery - Premium",
      category: "Electrical",
      brand: "Optima",
      partNumber: "BAT-P-005",
      description: "AGM battery with extended life",
      quantity: 3,
      minQuantity: 2,
      maxQuantity: 8,
      unitCost: 89.99,
      retailPrice: 179.99,
      supplier: "AutoZone",
      supplierContact: "(555) 123-4567",
      lastRestocked: "2024-01-09T16:30:00Z",
      nextRestock: "2024-01-19T16:30:00Z",
      location: "Shelf D-1",
      status: "low_stock"
    },
    {
      id: "P-006",
      name: "Tire - All Season",
      category: "Tires",
      brand: "Michelin",
      partNumber: "TIR-AS-006",
      description: "All-season tires for passenger vehicles",
      quantity: 12,
      minQuantity: 8,
      maxQuantity: 20,
      unitCost: 89.99,
      retailPrice: 159.99,
      supplier: "Tire Warehouse",
      supplierContact: "(555) 345-6789",
      lastRestocked: "2024-01-13T13:00:00Z",
      nextRestock: "2024-01-23T13:00:00Z",
      location: "Warehouse A",
      status: "in_stock"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_stock': return <TrendingUp className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredParts = partsInventory.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || part.status === stockFilter;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    total: partsInventory.length,
    inStock: partsInventory.filter(p => p.status === 'in_stock').length,
    lowStock: partsInventory.filter(p => p.status === 'low_stock').length,
    outOfStock: partsInventory.filter(p => p.status === 'out_of_stock').length,
    totalValue: partsInventory.reduce((sum, part) => sum + (part.quantity * part.unitCost), 0)
  };

  const categories = [...new Set(partsInventory.map(part => part.category))];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-gray-600 mt-1">Manage automotive parts and supplies</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restock Orders
          </Button>
          <Button asChild>
            <Link href="/dashboard/business/automotive/parts/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Parts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by part name, brand, or part number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Inventory</CardTitle>
          <CardDescription>
            {filteredParts.length} parts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParts.map((part) => (
              <div key={part.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{part.name}</h3>
                      <Badge className={getStatusColor(part.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(part.status)}
                          <span>{part.status.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                      <span className="text-sm text-gray-500">#{part.partNumber}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{part.brand}</h4>
                        <p className="text-sm text-gray-600">{part.category}</p>
                        <p className="text-sm text-gray-500">{part.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Stock Level</h4>
                        <p className="text-sm text-gray-600">
                          {part.quantity} / {part.maxQuantity} units
                        </p>
                        <p className="text-sm text-gray-500">
                          Min: {part.minQuantity} | Location: {part.location}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Pricing</h4>
                        <p className="text-sm text-gray-600">
                          Cost: ${part.unitCost} | Retail: ${part.retailPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total Value: ${(part.quantity * part.unitCost).toFixed(2)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Supplier</h4>
                        <p className="text-sm text-gray-600">{part.supplier}</p>
                        <p className="text-sm text-gray-500">{part.supplierContact}</p>
                        <p className="text-sm text-gray-500">
                          Next Restock: {formatDate(part.nextRestock)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Last Restocked: {formatDate(part.lastRestocked)}</span>
                        {part.quantity <= part.minQuantity && (
                          <span className="text-red-600 font-medium">
                            ⚠️ Reorder needed
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/parts/${part.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/business/automotive/parts/${part.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredParts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first part to inventory'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && stockFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/business/automotive/parts/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
