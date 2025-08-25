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
  Edit,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';

export default function RetailInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock inventory data
  const inventory = [
    {
      id: 1,
      name: "Premium T-Shirt",
      sku: "TSH-001",
      category: "Clothing",
      quantity: 45,
      minQuantity: 10,
      maxQuantity: 100,
      cost: 15.99,
      price: 29.99,
      supplier: "Fashion Supply Co",
      lastRestock: "2024-01-10",
      status: "in_stock"
    },
    {
      id: 2,
      name: "Denim Jeans",
      sku: "JNS-002",
      category: "Clothing",
      quantity: 23,
      minQuantity: 15,
      maxQuantity: 50,
      cost: 45.99,
      price: 89.99,
      supplier: "Denim World",
      lastRestock: "2024-01-08",
      status: "low_stock"
    },
    {
      id: 3,
      name: "Wireless Headphones",
      sku: "HPH-003",
      category: "Electronics",
      quantity: 8,
      minQuantity: 10,
      maxQuantity: 25,
      cost: 55.99,
      price: 79.99,
      supplier: "Tech Gadgets Inc",
      lastRestock: "2024-01-05",
      status: "out_of_stock"
    },
    {
      id: 4,
      name: "Designer Bag",
      sku: "BAG-004",
      category: "Accessories",
      quantity: 0,
      minQuantity: 5,
      maxQuantity: 20,
      cost: 85.99,
      price: 129.99,
      supplier: "Luxury Accessories",
      lastRestock: "2024-01-02",
      status: "out_of_stock"
    },
    {
      id: 5,
      name: "Sneakers",
      sku: "SNK-005",
      category: "Footwear",
      quantity: 15,
      minQuantity: 8,
      maxQuantity: 30,
      cost: 65.99,
      price: 119.99,
      supplier: "Shoe Central",
      lastRestock: "2024-01-12",
      status: "in_stock"
    },
    {
      id: 6,
      name: "Hoodie",
      sku: "HOD-006",
      category: "Clothing",
      quantity: 32,
      minQuantity: 12,
      maxQuantity: 60,
      cost: 25.99,
      price: 59.99,
      supplier: "Fashion Supply Co",
      lastRestock: "2024-01-15",
      status: "in_stock"
    }
  ];

  const categories = ['all', 'Clothing', 'Electronics', 'Accessories', 'Footwear'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const getInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.quantity * item.cost), 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minQuantity);
  };

  const getOutOfStockItems = () => {
    return inventory.filter(item => item.quantity === 0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length - 1} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getInventoryValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              At cost price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLowStockItems().length}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOutOfStockItems().length}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention needed
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
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your product stock levels and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">SKU</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Cost</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{item.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.sku}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-xs text-gray-500">
                          (min: {item.minQuantity})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">${item.cost}</td>
                    <td className="py-3 px-4 text-sm font-medium">${item.price}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.supplier}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
