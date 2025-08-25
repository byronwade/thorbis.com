'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Warehouse,
  ScanLine,
  Edit,
  Eye,
  MoreHorizontal,
  DollarSign,
  Calendar,
  MapPin,
  Archive
} from 'lucide-react';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock inventory data
  const inventory = [
    {
      id: 'INV-001',
      itemName: 'HVAC Filter - MERV 11',
      category: 'HVAC Parts',
      sku: 'HVF-M11-20X25',
      location: 'Warehouse A - Shelf B2',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: '$12.50',
      totalValue: '$562.50',
      supplier: 'HVAC Supply Co.',
      lastOrdered: '2024-08-15',
      lastUsed: '2024-08-24',
      status: 'in-stock',
      usageFrequency: 'High',
      description: '20x25 MERV 11 air filter for residential and commercial HVAC systems',
      barcode: '123456789012',
      expiryDate: null,
      avgMonthlyUsage: 15,
      leadTime: '3-5 days'
    },
    {
      id: 'INV-002',
      itemName: 'PEX Pipe - 1/2 inch',
      category: 'Plumbing Materials',
      sku: 'PEX-12-100FT',
      location: 'Warehouse A - Bay 3',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: '$0.85',
      totalValue: '$6.80',
      supplier: 'PlumbPro Supply',
      lastOrdered: '2024-07-28',
      lastUsed: '2024-08-23',
      status: 'low-stock',
      usageFrequency: 'Medium',
      description: '1/2 inch PEX tubing, 100 foot coil, red for hot water applications',
      barcode: '234567890123',
      expiryDate: null,
      avgMonthlyUsage: 12,
      leadTime: '1-2 days'
    },
    {
      id: 'INV-003',
      itemName: 'Circuit Breaker - 20A',
      category: 'Electrical Components',
      sku: 'CB-20A-SQ',
      location: 'Warehouse B - Bin 15',
      currentStock: 0,
      minStock: 10,
      maxStock: 30,
      unitCost: '$25.00',
      totalValue: '$0.00',
      supplier: 'ElectroMart',
      lastOrdered: '2024-08-20',
      lastUsed: '2024-08-22',
      status: 'out-of-stock',
      usageFrequency: 'High',
      description: 'Square D 20 amp single pole circuit breaker, QO series',
      barcode: '345678901234',
      expiryDate: null,
      avgMonthlyUsage: 8,
      leadTime: '2-3 days',
      expectedDelivery: '2024-08-26'
    },
    {
      id: 'INV-004',
      itemName: 'Pipe Joint Compound',
      category: 'Plumbing Materials',
      sku: 'PJC-32OZ',
      location: 'Warehouse A - Shelf C1',
      currentStock: 28,
      minStock: 12,
      maxStock: 36,
      unitCost: '$8.75',
      totalValue: '$245.00',
      supplier: 'PlumbPro Supply',
      lastOrdered: '2024-08-10',
      lastUsed: '2024-08-21',
      status: 'in-stock',
      usageFrequency: 'Medium',
      description: '32 oz pipe joint compound for threaded connections',
      barcode: '456789012345',
      expiryDate: '2026-08-10',
      avgMonthlyUsage: 6,
      leadTime: '1-2 days'
    },
    {
      id: 'INV-005',
      itemName: 'Wire Nuts - Assorted Pack',
      category: 'Electrical Components',
      sku: 'WN-ASST-100',
      location: 'Van 001 - Compartment 2',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unitCost: '$0.15',
      totalValue: '$22.50',
      supplier: 'ElectroMart',
      lastOrdered: '2024-08-05',
      lastUsed: '2024-08-24',
      status: 'overstocked',
      usageFrequency: 'High',
      description: 'Assorted wire nuts pack - various sizes for electrical connections',
      barcode: '567890123456',
      expiryDate: null,
      avgMonthlyUsage: 30,
      leadTime: '1 day'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'in-stock': 'bg-green-100 text-green-800 border-green-200',
      'low-stock': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'out-of-stock': 'bg-red-100 text-red-800 border-red-200',
      'overstocked': 'bg-purple-100 text-purple-800 border-purple-200',
      'discontinued': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'in-stock': <CheckCircle className="h-4 w-4" />,
      'low-stock': <AlertTriangle className="h-4 w-4" />,
      'out-of-stock': <AlertTriangle className="h-4 w-4" />,
      'overstocked': <TrendingUp className="h-4 w-4" />,
      'discontinued': <Archive className="h-4 w-4" />
    };
    return icons[status] || <Package className="h-4 w-4" />;
  };

  const getUsageFrequencyColor = (frequency) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600'
    };
    return colors[frequency] || 'text-gray-600';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const inventoryStats = {
    totalItems: inventory.length,
    inStock: inventory.filter(i => i.status === 'in-stock').length,
    lowStock: inventory.filter(i => i.status === 'low-stock').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    overstocked: inventory.filter(i => i.status === 'overstocked').length,
    totalValue: inventory.reduce((sum, item) => sum + parseFloat(item.totalValue.replace('$', '').replace(',', '')), 0),
    avgTurnover: 85 // Mock percentage
  };

  const categories = [...new Set(inventory.map(item => item.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track stock levels, manage suppliers, and optimize inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <ScanLine className="h-4 w-4 mr-2" />
            Scan Item
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inventoryStats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overstocked</p>
                <p className="text-2xl font-bold text-purple-600">{inventoryStats.overstocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Turnover Rate</p>
                <p className="text-2xl font-bold">{inventoryStats.avgTurnover}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items, SKUs, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="overstocked">Overstocked</option>
                <option value="discontinued">Discontinued</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="grid gap-4">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{item.itemName}</h3>
                    <Badge className={`${getStatusColor(item.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline">
                      {item.category}
                    </Badge>
                    <span className={`text-sm font-medium ${getUsageFrequencyColor(item.usageFrequency)}`}>
                      {item.usageFrequency} Usage
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>SKU: {item.sku}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Warehouse className="h-4 w-4" />
                      <span>Supplier: {item.supplier}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ScanLine className="h-4 w-4" />
                      <span>Barcode: {item.barcode}</span>
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Current: <span className={`font-bold ${item.currentStock <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>{item.currentStock}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4" />
                      <span>Min: {item.minStock}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Max: {item.maxStock}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Unit: {item.unitCost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-green-600">Total: {item.totalValue}</span>
                    </div>
                  </div>

                  {/* Stock Level Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Stock Level</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round((item.currentStock / item.maxStock) * 100)}% of capacity
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.currentStock <= item.minStock ? 'bg-red-600' :
                          item.currentStock >= item.maxStock * 0.8 ? 'bg-green-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last Ordered: {item.lastOrdered}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last Used: {item.lastUsed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Monthly Usage: {item.avgMonthlyUsage}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Lead Time: {item.leadTime}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Description: </span>
                      {item.description}
                    </p>
                    {item.expiryDate && (
                      <p className="mt-1">
                        <span className="font-medium">Expiry Date: </span>
                        <span className={new Date(item.expiryDate) < new Date(Date.now() + 90*24*60*60*1000) ? 'text-red-600 font-medium' : ''}>
                          {item.expiryDate}
                        </span>
                      </p>
                    )}
                    {item.expectedDelivery && (
                      <p className="mt-1">
                        <span className="font-medium">Expected Delivery: </span>
                        <span className="text-blue-600 font-medium">{item.expectedDelivery}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No inventory items found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or add new inventory items.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
