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
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Truck,
  MapPin,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Barcode,
  User
} from 'lucide-react';

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock equipment data
  const equipment = [
    {
      id: 'EQ-001',
      name: 'HVAC Diagnostic Kit',
      category: 'Diagnostic Tools',
      serialNumber: 'HD-2024-001',
      model: 'ThermoScan Pro X5',
      manufacturer: 'TechPro',
      status: 'available',
      condition: 'excellent',
      location: 'Main Warehouse',
      assignedTo: null,
      purchaseDate: '2024-01-15',
      purchasePrice: '$2,450.00',
      warrantyExpiry: '2027-01-15',
      lastMaintenance: '2024-07-15',
      nextMaintenance: '2024-10-15',
      utilizationRate: '78%'
    },
    {
      id: 'EQ-002',
      name: 'Commercial Drain Snake',
      category: 'Plumbing Tools',
      serialNumber: 'PL-2024-002',
      model: 'DrainMaster 500',
      manufacturer: 'PlumbCorp',
      status: 'in-use',
      condition: 'good',
      location: 'Vehicle VAN-001',
      assignedTo: 'Mike Rodriguez',
      purchaseDate: '2023-08-20',
      purchasePrice: '$1,850.00',
      warrantyExpiry: '2025-08-20',
      lastMaintenance: '2024-06-10',
      nextMaintenance: '2024-09-10',
      utilizationRate: '92%'
    },
    {
      id: 'EQ-003',
      name: 'Digital Multimeter Set',
      category: 'Electrical Tools',
      serialNumber: 'EL-2024-003',
      model: 'ElectroMeter Pro 3000',
      manufacturer: 'VoltTech',
      status: 'maintenance',
      condition: 'fair',
      location: 'Maintenance Shop',
      assignedTo: null,
      purchaseDate: '2023-03-10',
      purchasePrice: '$850.00',
      warrantyExpiry: '2026-03-10',
      lastMaintenance: '2024-08-20',
      nextMaintenance: '2024-11-20',
      utilizationRate: '65%'
    },
    {
      id: 'EQ-004',
      name: 'Pressure Washer',
      category: 'Cleaning Equipment',
      serialNumber: 'CL-2024-004',
      model: 'PowerClean 2500',
      manufacturer: 'CleanTech',
      status: 'out-of-order',
      condition: 'poor',
      location: 'Maintenance Shop',
      assignedTo: null,
      purchaseDate: '2022-05-15',
      purchasePrice: '$1,200.00',
      warrantyExpiry: '2024-05-15',
      lastMaintenance: '2024-05-01',
      nextMaintenance: '2024-12-01',
      utilizationRate: '45%'
    },
    {
      id: 'EQ-005',
      name: 'Pipe Threading Machine',
      category: 'Plumbing Tools',
      serialNumber: 'PL-2024-005',
      model: 'ThreadMaster 150',
      manufacturer: 'PlumbCorp',
      status: 'available',
      condition: 'excellent',
      location: 'Main Warehouse',
      assignedTo: null,
      purchaseDate: '2024-02-28',
      purchasePrice: '$3,200.00',
      warrantyExpiry: '2027-02-28',
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2024-11-15',
      utilizationRate: '34%'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-100 text-green-800 border-green-200',
      'in-use': 'bg-blue-100 text-blue-800 border-blue-200',
      'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'out-of-order': 'bg-red-100 text-red-800 border-red-200',
      'retired': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'excellent': 'text-green-600',
      'good': 'text-blue-600',
      'fair': 'text-yellow-600',
      'poor': 'text-red-600'
    };
    return colors[condition] || 'text-gray-600';
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in-use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    outOfOrder: equipment.filter(e => e.status === 'out-of-order').length,
    totalValue: equipment.reduce((sum, item) => sum + parseFloat(item.purchasePrice.replace('$', '').replace(',', '')), 0)
  };

  const categories = [...new Set(equipment.map(item => item.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Equipment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all field service equipment and tools</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Barcode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Equipment</p>
                <p className="text-2xl font-bold">{equipmentStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-600">{equipmentStats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-blue-600">{equipmentStats.inUse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{equipmentStats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Order</p>
                <p className="text-2xl font-bold text-red-600">{equipmentStats.outOfOrder}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">${equipmentStats.totalValue.toLocaleString()}</p>
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
                placeholder="Search equipment, models, serial numbers..."
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
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-order">Out of Order</option>
                <option value="retired">Retired</option>
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

      {/* Equipment List */}
      <div className="grid gap-4">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{item.name}</h3>
                    <Badge className={`${getStatusColor(item.status)} border`}>
                      {item.status.charAt(0).toUpperCase() + item.status.replace('-', ' ').slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getConditionColor(item.condition)}>
                      {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Model: {item.model}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Barcode className="h-4 w-4" />
                      <span>Serial: {item.serialNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location: {item.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigned: {item.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Purchased: {item.purchaseDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Value: {item.purchasePrice}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4" />
                      <span>Last Service: {item.lastMaintenance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Next Service: {item.nextMaintenance}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                      <span className="font-medium">{item.utilizationRate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">Warranty:</span>
                      <span className={`font-medium ${new Date(item.warrantyExpiry) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                        {item.warrantyExpiry}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
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

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No equipment found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or add new equipment.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Equipment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
