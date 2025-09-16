'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus,
  Minus,
  Save,
  X,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  FileText,
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { useOfflineWorkOrders } from '@/lib/offline-work-order-manager';
import { FormErrorBoundary } from '@/components/error-boundary';
import type { 
  WorkOrderMetadata, 
  WorkOrderStatus, 
  WorkOrderPriority, 
  WorkOrderType,
  LineItem,
  Material,
  Equipment 
} from '@/lib/offline-work-order-manager';

interface WorkOrderFormProps {
  workOrder?: WorkOrderMetadata;
  onSave: (workOrderId: string) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  templateId?: string;
}

function WorkOrderFormContent({
  workOrder,
  onSave,
  onCancel,
  mode = 'create',
  templateId
}: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    title: ',
    description: ',
    customerName: ',
    customerEmail: ',
    customerPhone: ',
    serviceLocation: ',
    priority: 'normal' as WorkOrderPriority,
    type: 'repair' as WorkOrderType,
    estimatedHours: 1,
    estimatedCost: 0,
    scheduledDate: ',
    assignedTechnician: ',
    isRecurring: false,
    recurringPattern: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    tags: [] as string[],
    customFields: Record<string, unknown> as Record<string, unknown>
  });

  const [lineItems, setLineItems] = useState<Partial<LineItem>[]>([]);
  const [materials, setMaterials] = useState<Partial<Material>[]>([]);
  const [equipment, setEquipment] = useState<Partial<Equipment>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workOrderManager = useOfflineWorkOrders();

  // Load work order data if editing
  useEffect(() => {
    if (workOrder && mode === 'edit') {
      setFormData({
        title: workOrder.title,
        description: workOrder.description,
        customerName: workOrder.customerName,
        customerEmail: workOrder.customerEmail || ',
        customerPhone: workOrder.customerPhone || ',
        serviceLocation: workOrder.serviceLocation,
        priority: workOrder.priority,
        type: workOrder.type,
        estimatedHours: workOrder.estimatedHours,
        estimatedCost: workOrder.estimatedCost,
        scheduledDate: workOrder.scheduledDate ? workOrder.scheduledDate.toISOString().split('T')[0] : ',
        assignedTechnician: workOrder.assignedTechnician || ',
        isRecurring: workOrder.isRecurring,
        recurringPattern: workOrder.recurringPattern || 'weekly',
        tags: workOrder.tags,
        customFields: workOrder.customFields || {}
      });

      setLineItems(workOrder.lineItems || []);
      setMaterials(workOrder.materials || []);
      setEquipment(workOrder.equipment || []);
    }
  }, [workOrder, mode]);

  // Load template if specified
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId && mode === 'create') {
        try {
          const template = await workOrderManager.getWorkOrderTemplate(templateId);
          if (template) {
            setFormData(prev => ({
              ...prev,
              ...template.defaultData
            }));
            setLineItems(template.lineItems || []);
            setMaterials(template.materials || []);
            setEquipment(template.equipment || []);
          }
        } catch (error) {
          console.error('Failed to load template:', error);
        }
      }
    };

    loadTemplate();
  }, [templateId, mode, workOrderManager]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      description: ',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const updateLineItem = (index: number, field: string, value: unknown) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    setMaterials(prev => [...prev, {
      name: ',
      quantity: 1,
      unit: 'each',
      costPerUnit: 0,
      totalCost: 0,
      supplier: '
    }]);
  };

  const updateMaterial = (index: number, field: string, value: unknown) => {
    setMaterials(prev => prev.map((material, i) => {
      if (i === index) {
        const updated = { ...material, [field]: value };
        if (field === 'quantity' || field === 'costPerUnit') {
          updated.totalCost = (updated.quantity || 0) * (updated.costPerUnit || 0);
        }
        return updated;
      }
      return material;
    }));
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const addEquipment = () => {
    setEquipment(prev => [...prev, {
      name: ',
      model: ',
      serialNumber: ',
      condition: 'good',
      notes: '
    }]);
  };

  const updateEquipment = (index: number, field: string, value: unknown) => {
    setEquipment(prev => prev.map((eq, i) => 
      i === index ? { ...eq, [field]: value } : eq
    ));
  };

  const removeEquipment = (index: number) => {
    setEquipment(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.customerName.trim()) {
        throw new Error('Customer name is required');
      }

      const workOrderData = {
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        lineItems: lineItems.filter(item => item.description?.trim()),
        materials: materials.filter(material => material.name?.trim()),
        equipment: equipment.filter(eq => eq.name?.trim()),
        totalCost: lineItems.reduce((sum, item) => sum + (item.total || 0), 0) +
                   materials.reduce((sum, material) => sum + (material.totalCost || 0), 0)
      };

      let workOrderId: string;

      if (mode === 'edit' && workOrder) {
        await workOrderManager.updateWorkOrder(workOrder.id, workOrderData);
        workOrderId = workOrder.id;
      } else {
        workOrderId = await workOrderManager.createWorkOrder(workOrderData);
      }

      onSave(workOrderId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save work order');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      emergency: 'bg-red-600/30 text-red-300 border-red-600/40'
    };
    return colors[priority];
  };

  const calculateTotals = () => {
    const lineItemTotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const materialTotal = materials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
    return {
      lineItems: lineItemTotal,
      materials: materialTotal,
      total: lineItemTotal + materialTotal
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Work Order' : 'Create Work Order'}
          </h2>
          {workOrder && (
            <p className="text-neutral-400">#{workOrder.workOrderNumber}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-neutral-400">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of work"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-neutral-400">Work Order Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="warranty">Warranty</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-neutral-400">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of work to be performed"
                  className="bg-neutral-800 border-neutral-700"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-neutral-400">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduledDate" className="text-neutral-400">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-neutral-400">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Customer or business name"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail" className="text-neutral-400">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="customer@example.com"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-neutral-400">Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serviceLocation" className="text-neutral-400">Service Location</Label>
                <Input
                  id="serviceLocation"
                  value={formData.serviceLocation}
                  onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Line Items
                </CardTitle>
                <Button size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="text-neutral-400 text-center py-4">No line items added</p>
              ) : (
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <Label className="text-neutral-400 text-xs">Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Service description"
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-neutral-400 text-xs">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-neutral-400 text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice || 0}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-neutral-400 text-xs">Total</Label>
                        <p className="text-white text-sm py-2">${(item.total || 0).toFixed(2)}</p>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="bg-neutral-700" />
                  <div className="flex justify-end">
                    <p className="text-white font-medium">
                      Line Items Total: ${totals.lineItems.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Materials
                </CardTitle>
                <Button size="sm" onClick={addMaterial}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="text-neutral-400 text-center py-4">No materials added</p>
              ) : (
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label className="text-neutral-400 text-xs">Material Name</Label>
                        <Input
                          value={material.name || ''}
                          onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                          placeholder="Material name"
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-neutral-400 text-xs">Qty</Label>
                        <Input
                          type="number"
                          value={material.quantity || 1}
                          onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-neutral-400 text-xs">Unit</Label>
                        <Input
                          value={material.unit || 'each'}
                          onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-neutral-400 text-xs">Cost/Unit</Label>
                        <Input
                          type="number"
                          value={material.costPerUnit || 0}
                          onChange={(e) => updateMaterial(index, 'costPerUnit', parseFloat(e.target.value) || 0)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-neutral-400 text-xs">Total</Label>
                        <p className="text-white text-sm py-2">${(material.totalCost || 0).toFixed(2)}</p>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="bg-neutral-700" />
                  <div className="flex justify-end">
                    <p className="text-white font-medium">
                      Materials Total: ${totals.materials.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-400">Priority:</span>
                <Badge variant="outline" className={getPriorityColor(formData.priority)}>
                  {formData.priority}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-400">Type:</span>
                <span className="text-white">{formData.type}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Est. Hours:</span>
                <span className="text-white">{formData.estimatedHours}</span>
              </div>

              <Separator className="bg-neutral-700" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Line Items:</span>
                  <span className="text-white">${totals.lineItems.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Materials:</span>
                  <span className="text-white">${totals.materials.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-white">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assignedTechnician" className="text-neutral-400">Technician</Label>
                <Input
                  id="assignedTechnician"
                  value={formData.assignedTechnician}
                  onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
                  placeholder="Assign to technician"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label htmlFor="estimatedHours" className="text-neutral-400">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrderForm(props: WorkOrderFormProps) {
  return (
    <FormErrorBoundary>
      <WorkOrderFormContent {...props} />
    </FormErrorBoundary>
  );
}