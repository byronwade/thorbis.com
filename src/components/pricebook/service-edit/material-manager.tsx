'use client'

import { useState } from 'react'
import { Plus, Trash2, Search, ExternalLink, Package, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ServiceMaterial } from '@/types/pricebook'

interface MaterialManagerProps {
  materials: ServiceMaterial[]
  onChange: (materials: ServiceMaterial[]) => void
}

// Mock supplier data
const suppliers = [
  { id: 'ferguson', name: 'Ferguson Plumbing', type: 'distributor', website: 'ferguson.com' },
  { id: 'home-depot-pro', name: 'Home Depot Pro', type: 'retail', website: 'homedepot.com' },
  { id: 'electrical-wholesale', name: 'Electrical Wholesale', type: 'distributor', website: 'ewsupply.com' },
  { id: 'local-supply', name: 'Local Supply House', type: 'local', website: null },
  { id: 'amazon-business', name: 'Amazon Business', type: 'online', website: 'amazon.com' },
]

// Mock catalog items
const catalogItems = [
  {
    id: 'pipe-pvc-4inch',
    name: '4" PVC Pipe',
    description: 'Schedule 40 PVC pipe for drainage',
    unitPrice: 8.50,
    unit: 'linear_foot',
    category: 'plumbing-pipes',
    supplier: 'ferguson',
    partNumber: 'PVC-SCH40-4',
    inStock: true
  },
  {
    id: 'water-heater-40gal',
    name: '40 Gallon Water Heater',
    description: 'Gas water heater with 40-gallon capacity',
    unitPrice: 485.00,
    unit: 'each',
    category: 'plumbing-appliances',
    supplier: 'home-depot-pro',
    partNumber: 'WH-GAS-40',
    inStock: true
  },
  {
    id: 'wire-12awg-romex',
    name: '12 AWG Romex Wire',
    description: '12 gauge copper wire for 20 amp circuits',
    unitPrice: 1.25,
    unit: 'linear_foot',
    category: 'electrical-wire',
    supplier: 'electrical-wholesale',
    partNumber: 'ROM-12-2-WG',
    inStock: true
  }
]

export function MaterialManager({ materials, onChange }: MaterialManagerProps) {
  const [searchQuery, setSearchQuery] = useState(')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>(')

  const handleAddMaterial = (item?: typeof catalogItems[0]) => {
    const newMaterial: ServiceMaterial = {
      id: item?.id || 'material-${Date.now()}',
      name: item?.name || ',
      description: item?.description || ',
      unitPrice: item?.unitPrice || 0,
      unit: item?.unit as any || 'each',
      quantity: 1,
      markup: 25,
      required: false,
      category: item?.category || ',
      supplier: item?.supplier || ',
      partNumber: item?.partNumber || ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onChange([...materials, newMaterial])
    setShowAddDialog(false)
    setSelectedCatalogItem(')
  }

  const handleUpdateMaterial = (id: string, updates: Partial<ServiceMaterial>) => {
    onChange(materials.map(material => 
      material.id === id 
        ? { ...material, ...updates, updatedAt: new Date().toISOString() }
        : material
    ))
  }

  const handleRemoveMaterial = (id: string) => {
    onChange(materials.filter(material => material.id !== id))
  }

  const getTotalMaterialCost = () => {
    return materials.reduce((sum, material) => 
      sum + (material.unitPrice * material.quantity * (1 + material.markup / 100)), 0
    )
  }

  const getSupplierInfo = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)
  }

  const filteredCatalogItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Materials & Supplies</h2>
            <p className="text-sm text-neutral-400">Manage materials needed for this service</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-neutral-400">Total Material Cost</div>
              <div className="text-lg font-semibold text-white">${getTotalMaterialCost().toFixed(2)}</div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-950 border-neutral-800 max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Material</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search catalog items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-neutral-900 border-neutral-700 text-white"
                    />
                  </div>

                  {/* Catalog Items */}
                  <div className="max-h-96 overflow-auto space-y-2">
                    {filteredCatalogItems.map((item) => {
                      const supplier = getSupplierInfo(item.supplier)
                      return (
                        <div
                          key={item.id}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 cursor-pointer hover:border-neutral-700 transition-colors"
                          onClick={() => handleAddMaterial(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-white">{item.name}</h4>
                                {item.inStock && (
                                  <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                                    In Stock
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-neutral-400 mb-2">{item.description}</p>
                              <div className="flex items-center gap-4 text-xs text-neutral-500">
                                <span>#{item.partNumber}</span>
                                {supplier && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{supplier.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-white">${item.unitPrice}</div>
                              <div className="text-xs text-neutral-500">per {item.unit}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Custom Material */}
                  <div className="border-t border-neutral-800 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleAddMaterial()}
                      className="w-full bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Add Custom Material
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {materials.map((material) => {
          const supplier = getSupplierInfo(material.supplier)
          const totalCost = material.unitPrice * material.quantity * (1 + material.markup / 100)
          
          return (
            <div key={material.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-neutral-300">Material Name</Label>
                    <Input
                      value={material.name}
                      onChange={(e) => handleUpdateMaterial(material.id, { name: e.target.value })}
                      className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                      placeholder="Material name"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-neutral-300">Description</Label>
                    <Input
                      value={material.description}
                      onChange={(e) => handleUpdateMaterial(material.id, { description: e.target.value })}
                      className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                      placeholder="Material description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium text-neutral-300">Part Number</Label>
                      <Input
                        value={material.partNumber}
                        onChange={(e) => handleUpdateMaterial(material.id, { partNumber: e.target.value })}
                        className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                        placeholder="Part #"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-neutral-300">Unit</Label>
                      <Select 
                        value={material.unit} 
                        onValueChange={(value) => handleUpdateMaterial(material.id, { unit: value as any })}
                      >
                        <SelectTrigger className="mt-1 bg-neutral-900 border-neutral-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                          <SelectItem value="each">Each</SelectItem>
                          <SelectItem value="linear_foot">Linear Foot</SelectItem>
                          <SelectItem value="square_foot">Square Foot</SelectItem>
                          <SelectItem value="gallon">Gallon</SelectItem>
                          <SelectItem value="pound">Pound</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="roll">Roll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm font-medium text-neutral-300">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={material.unitPrice}
                        onChange={(e) => handleUpdateMaterial(material.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-neutral-300">Quantity</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={material.quantity}
                        onChange={(e) => handleUpdateMaterial(material.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-neutral-300">Markup (%)</Label>
                    <Input
                      type="number"
                      value={material.markup}
                      onChange={(e) => handleUpdateMaterial(material.id, { markup: parseInt(e.target.value) || 0 })}
                      className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-neutral-300">Required Material</Label>
                    <Switch
                      checked={material.required}
                      onCheckedChange={(checked) => handleUpdateMaterial(material.id, { required: checked })}
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <div className="text-sm text-neutral-400">Total Cost</div>
                    <div className="text-lg font-semibold text-white">${totalCost.toFixed(2)}</div>
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-neutral-300">Supplier</Label>
                    <Select 
                      value={material.supplier} 
                      onValueChange={(value) => handleUpdateMaterial(material.id, { supplier: value })}
                    >
                      <SelectTrigger className="mt-1 bg-neutral-900 border-neutral-700 text-white">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{supplier.name}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {supplier.type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {supplier && (
                    <div className="bg-neutral-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{supplier.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {supplier.type}
                        </Badge>
                      </div>
                      {supplier.website && (
                        <a
                          href={'https://${supplier.website}'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {supplier.website}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMaterial(material.id)}
                      className="text-red-400 border-red-600/30 hover:bg-red-600/10 hover:border-red-600/50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {materials.length === 0 && (
          <div className="text-center py-12 bg-neutral-950 border border-neutral-800 rounded-lg">
            <Package className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Materials Added</h3>
            <p className="text-neutral-400 mb-4">Add materials and supplies needed for this service</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Material
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}