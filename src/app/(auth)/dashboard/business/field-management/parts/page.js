'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Filter, Package, Wrench, Calendar, DollarSign, 
  MapPin, AlertTriangle, CheckCircle, Edit, Eye, MoreHorizontal,
  Truck, Building, User, Clock, TrendingUp, BarChart3
} from 'lucide-react';

export default function PartsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const parts = [
    {
      id: 'PART-001', name: 'Compressor Motor - 3HP', category: 'HVAC Motors', 
      partNumber: 'CM-3HP-208V', currentStock: 4, minStock: 2, maxStock: 8,
      unitCost: '$285.00', totalValue: '$1,140.00', status: 'in-stock',
      location: 'Warehouse A - Heavy Equipment', supplier: 'HVAC Pro Parts',
      compatibility: ['Carrier 48TM008', 'Trane XR13', 'Lennox XC16'],
      lastUsed: '2024-08-20', avgUsage: 2, warranty: '2 years'
    },
    {
      id: 'PART-002', name: 'PVC Coupling - 4 inch', category: 'Plumbing Fittings',
      partNumber: 'PVC-CP-4IN', currentStock: 15, minStock: 25, maxStock: 75,
      unitCost: '$3.25', totalValue: '$48.75', status: 'low-stock',
      location: 'Van 002 - Plumbing Kit', supplier: 'PlumbSupply Direct',
      compatibility: ['Schedule 40 PVC', 'DWV Systems'], 
      lastUsed: '2024-08-24', avgUsage: 8, warranty: 'N/A'
    }
  ];

  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (statusFilter === 'all' || part.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parts Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage specialized parts and components inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline"><BarChart3 className="h-4 w-4 mr-2" />Analytics</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Add Part</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Parts', value: parts.length, icon: Package, color: 'text-blue-600' },
          { label: 'In Stock', value: parts.filter(p => p.status === 'in-stock').length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Low Stock', value: parts.filter(p => p.status === 'low-stock').length, icon: AlertTriangle, color: 'text-yellow-600' },
          { label: 'Total Value', value: `$${parts.reduce((sum, p) => sum + parseFloat(p.totalValue.replace('$', '').replace(',', '')), 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search parts, part numbers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2">
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredParts.map((part) => (
          <Card key={part.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">{part.name}</h3>
                    <Badge className={part.status === 'in-stock' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {part.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline">{part.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span>Part #: {part.partNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{part.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{part.supplier}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Last Used: {part.lastUsed}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <span>Stock: <strong className={part.currentStock <= part.minStock ? 'text-red-600' : 'text-green-600'}>{part.currentStock}</strong>/{part.maxStock}</span>
                    <span>Unit Cost: <strong>{part.unitCost}</strong></span>
                    <span>Total Value: <strong className="text-green-600">{part.totalValue}</strong></span>
                    <span>Avg Monthly Usage: <strong>{part.avgUsage}</strong></span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Compatible with:</strong></p>
                    <div className="flex flex-wrap gap-1">
                      {part.compatibility.map(model => (
                        <Badge key={model} variant="outline" className="text-xs">{model}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                  <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
