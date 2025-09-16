'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  FileText,
  Wrench,
  Clock,
  DollarSign,
  Star,
  Grid,
  List
} from 'lucide-react';

import { useOfflineWorkOrders } from '@/lib/offline-work-order-manager';
import type { WorkOrderTemplate, WorkOrderType, WorkOrderPriority } from '@/lib/offline-work-order-manager';

interface WorkOrderTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
  onCreateFromTemplate?: (templateId: string) => void;
  showSelection?: boolean;
}

export default function WorkOrderTemplates({
  onSelectTemplate,
  onCreateFromTemplate,
  showSelection = false
}: WorkOrderTemplatesProps) {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const workOrderManager = useOfflineWorkOrders();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templateList = await workOrderManager.getWorkOrderTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await workOrderManager.deleteWorkOrderTemplate(templateId);
        await loadTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleDuplicateTemplate = async (template: WorkOrderTemplate) => {
    try {
      const newTemplate = {
        ...template,
        name: '${template.name} (Copy)',
        isDefault: false
      };
      await workOrderManager.createWorkOrderTemplate(newTemplate);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.defaultData.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: WorkOrderType) => {
    const colors = {
      repair: 'bg-red-500/20 text-red-400 border-red-500/30',
      maintenance: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      installation: 'bg-green-500/20 text-green-400 border-green-500/30',
      inspection: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      emergency: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      preventive: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      warranty: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      upgrade: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      consultation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      followup: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    };
    return colors[type as keyof typeof colors] || colors.repair;
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

  const calculateTemplateTotal = (template: WorkOrderTemplate) => {
    const lineItemsTotal = (template.lineItems || []).reduce((sum, item) => sum + (item.total || 0), 0);
    const materialsTotal = (template.materials || []).reduce((sum, material) => sum + (material.totalCost || 0), 0);
    return lineItemsTotal + materialsTotal;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Work Order Templates</h2>
          <p className="text-neutral-400">Manage and use pre-configured work order templates</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md bg-neutral-800 border-neutral-700">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-neutral-800 border-neutral-700"
        />
      </div>

      {/* Templates Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-400">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">No templates found</p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery(')} className="mt-2">
              Clear Search
            </Button>
          )}
        </div>
      ) : viewMode === 'grid` ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id}
              className="bg-neutral-900 border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template);
                setShowPreview(true);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-base truncate flex items-center gap-2">
                      {template.name}
                      {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    <p className="text-neutral-400 text-sm truncate">{template.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getTypeColor(template.defaultData.type)}>
                    {template.defaultData.type}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(template.defaultData.priority)}>
                    {template.defaultData.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span>{template.defaultData.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <DollarSign className="h-3 w-3" />
                    <span>${calculateTemplateTotal(template).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <FileText className="h-3 w-3" />
                    <span>{(template.lineItems || []).length} items</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Wrench className="h-3 w-3" />
                    <span>{(template.materials || []).length} materials</span>
                  </div>
                </div>

                <div className="flex gap-1 pt-2">
                  {showSelection ? (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate?.(template.id);
                      }}
                    >
                      Select
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateFromTemplate?.(template.id);
                      }}
                    >
                      Use Template
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateTemplate(template);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id}
              className="bg-neutral-900 border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template);
                setShowPreview(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">{template.name}</h3>
                      {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <p className="text-neutral-400 text-sm truncate mb-2">{template.description}</p>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getTypeColor(template.defaultData.type)}>
                        {template.defaultData.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(template.defaultData.priority)}>
                        {template.defaultData.priority}
                      </Badge>
                      
                      <div className="flex items-center gap-1 text-neutral-400 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>{template.defaultData.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-400 text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span>${calculateTemplateTotal(template).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    {showSelection ? (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate?.(template.id);
                        }}
                      >
                        Select
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateFromTemplate?.(template.id);
                        }}
                      >
                        Use Template
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTemplate(template);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {selectedTemplate.name}
                {selectedTemplate.isDefault && <Star className="h-5 w-5 text-yellow-500" />}
              </DialogTitle>
              <DialogDescription>{selectedTemplate.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Template Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-neutral-400 text-sm">Type:</span>
                  <Badge variant="outline" className={`ml-2 ${getTypeColor(selectedTemplate.defaultData.type)}'}>
                    {selectedTemplate.defaultData.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Priority:</span>
                  <Badge variant="outline" className={'ml-2 ${getPriorityColor(selectedTemplate.defaultData.priority)}'}>
                    {selectedTemplate.defaultData.priority}
                  </Badge>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Est. Hours:</span>
                  <span className="text-white ml-2">{selectedTemplate.defaultData.estimatedHours}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Est. Cost:</span>
                  <span className="text-white ml-2">${calculateTemplateTotal(selectedTemplate).toFixed(2)}</span>
                </div>
              </div>

              {/* Line Items */}
              {selectedTemplate.lineItems && selectedTemplate.lineItems.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {selectedTemplate.lineItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg">
                        <div>
                          <p className="text-white">{item.description}</p>
                          <p className="text-neutral-400 text-sm">Qty: {item.quantity} × ${item.unitPrice}</p>
                        </div>
                        <p className="text-white font-medium">${item.total?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {selectedTemplate.materials && selectedTemplate.materials.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Materials</h4>
                  <div className="space-y-2">
                    {selectedTemplate.materials.map((material, index) => (
                      <div key={index} className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg">
                        <div>
                          <p className="text-white">{material.name}</p>
                          <p className="text-neutral-400 text-sm">
                            {material.quantity} {material.unit} × ${material.costPerUnit}
                          </p>
                        </div>
                        <p className="text-white font-medium">${material.totalCost?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                {showSelection ? (
                  <Button 
                    onClick={() => {
                      onSelectTemplate?.(selectedTemplate.id);
                      setShowPreview(false);
                    }}
                  >
                    Select Template
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      onCreateFromTemplate?.(selectedTemplate.id);
                      setShowPreview(false);
                    }}
                  >
                    Create Work Order
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => handleDuplicateTemplate(selectedTemplate)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}