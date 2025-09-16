'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  FileText,
  Camera,
  Signature,
  CheckCircle,
  AlertTriangle,
  Navigation,
  MessageCircle,
  Wrench,
  DollarSign,
  Calendar,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Timer
} from 'lucide-react';

import { useOfflineWorkOrders } from '@/lib/offline-work-order-manager';
import { useOfflineDocuments } from '@/lib/offline-document-manager';
import type { WorkOrderMetadata, WorkOrderStatus, WorkOrderPriority } from '@/lib/offline-work-order-manager';
import SignatureCapture, { type SignatureData } from './signature-capture';
import DocumentUploadWidget from '../documents/document-upload-widget';

interface MobileWorkOrderViewProps {
  workOrderId: string;
  onStatusChange?: (workOrderId: string, newStatus: WorkOrderStatus) => void;
  onClose?: () => void;
}

export default function MobileWorkOrderView({
  workOrderId,
  onStatusChange,
  onClose
}: MobileWorkOrderViewProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrderMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [timeTracking, setTimeTracking] = useState({
    isActive: false,
    startTime: null as Date | null,
    totalTime: 0 // in minutes
  });

  const workOrderManager = useOfflineWorkOrders();
  const documentManager = useOfflineDocuments();

  useEffect(() => {
    loadWorkOrder();
  }, [workOrderId]);

  const loadWorkOrder = async () => {
    setLoading(true);
    try {
      const wo = await workOrderManager.getWorkOrder(workOrderId);
      setWorkOrder(wo);
      
      // Load time tracking data if available
      const timeData = wo.customFields?.timeTracking;
      if (timeData) {
        setTimeTracking(timeData);
      }
    } catch (error) {
      console.error('Failed to load work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (!workOrder) return;

    try {
      await workOrderManager.updateStatus(workOrder.id, newStatus, 'Status updated to ${newStatus} via mobile app');
      await loadWorkOrder();
      onStatusChange?.(workOrder.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleStartTimer = async () => {
    const startTime = new Date();
    const newTimeTracking = {
      isActive: true,
      startTime,
      totalTime: timeTracking.totalTime
    };
    
    setTimeTracking(newTimeTracking);
    
    if (workOrder) {
      await workOrderManager.updateWorkOrder(workOrder.id, {
        customFields: {
          ...workOrder.customFields,
          timeTracking: newTimeTracking
        }
      });
    }
  };

  const handleStopTimer = async () => {
    if (!timeTracking.startTime) return;

    const endTime = new Date();
    const sessionTime = Math.round((endTime.getTime() - timeTracking.startTime.getTime()) / 60000); // minutes
    const newTimeTracking = {
      isActive: false,
      startTime: null,
      totalTime: timeTracking.totalTime + sessionTime
    };
    
    setTimeTracking(newTimeTracking);
    
    if (workOrder) {
      await workOrderManager.updateWorkOrder(workOrder.id, {
        customFields: {
          ...workOrder.customFields,
          timeTracking: newTimeTracking
        }
      });
    }
  };

  const handleSignatureSave = async (signatureData: SignatureData) => {
    if (!workOrder) return;

    try {
      // Save signature as document
      const signatureBlob = await fetch(signatureData.signatureDataUrl).then(r => r.blob());
      const signatureFile = new File([signatureBlob], 'signature_${workOrder.workOrderNumber}.png', { type: 'image/png' });
      
      const documentId = await documentManager.uploadDocument(signatureFile, {
        category: 'signature',
        description: 'Customer signature for work order ${workOrder.workOrderNumber}',
        relatedEntityId: workOrder.id,
        relatedEntityType: 'work_order',
        tags: ['signature', 'completion', workOrder.workOrderNumber]
      });

      // Update work order with signature info
      await workOrderManager.updateWorkOrder(workOrder.id, {
        customFields: {
          ...workOrder.customFields,
          customerSignature: {
            documentId,
            signerName: signatureData.signerName,
            timestamp: signatureData.timestamp
          }
        }
      });

      setShowSignatureCapture(false);
      await loadWorkOrder();
    } catch (error) {
      console.error('Failed to save signature:', error);
    }
  };

  const handlePhotoUpload = async (documentIds: string[]) => {
    if (!workOrder) return;

    try {
      // Add photo references to work order
      const existingPhotos = workOrder.customFields?.photos || [];
      await workOrderManager.updateWorkOrder(workOrder.id, {
        customFields: {
          ...workOrder.customFields,
          photos: [...existingPhotos, ...documentIds]
        }
      });

      setShowPhotoUpload(false);
      await loadWorkOrder();
    } catch (error) {
      console.error('Failed to save photos:', error);
    }
  };

  const openDirections = () => {
    if (workOrder?.serviceLocation) {
      const address = encodeURIComponent(workOrder.serviceLocation);
      window.open('https://maps.google.com/maps?q=${address}', '_blank');
    }
  };

  const callCustomer = () => {
    if (workOrder?.customerPhone) {
      window.open(`tel:${workOrder.customerPhone}');
    }
  };

  const emailCustomer = () => {
    if (workOrder?.customerEmail) {
      window.open('mailto:${workOrder.customerEmail}');
    }
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    const colors = {
      draft: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      on_hold: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      billed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      requires_approval: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      emergency: 'bg-red-600/30 text-red-300 border-red-600/40',
      archived: 'bg-neutral-600/20 text-neutral-500 border-neutral-600/30'
    };
    return colors[status];
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return '${hours}h ${mins}m';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400">Loading work order...</p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400">Work order not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Mobile Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-white truncate">#{workOrder.workOrderNumber}</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className={getStatusColor(workOrder.status)}>
              {workOrder.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
              {workOrder.priority}
            </Badge>
          </div>
        </div>
        
        <h2 className="text-white font-medium">{workOrder.title}</h2>
        <p className="text-neutral-400 text-sm">{workOrder.customerName}</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={callCustomer} disabled={!workOrder.customerPhone}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={emailCustomer} disabled={!workOrder.customerEmail}>
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={openDirections} disabled={!workOrder.serviceLocation}>
            <Navigation className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPhotoUpload(true)}>
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Tracking */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-400">Time:</span>
            <span className="text-white font-medium">
              {formatTime(timeTracking.totalTime)}
              {timeTracking.isActive && timeTracking.startTime && (
                <span className="text-green-400 ml-1">
                  +{Math.round((Date.now() - timeTracking.startTime.getTime()) / 60000)}m
                </span>
              )}
            </span>
          </div>
          
          <div className="flex gap-1">
            {!timeTracking.isActive ? (
              <Button size="sm" onClick={handleStartTimer}>
                <PlayCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={handleStopTimer}>
                <StopCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="grid grid-cols-2 gap-2">
          {workOrder.status === 'assigned' && (
            <Button size="sm" onClick={() => handleStatusChange('in_progress')}>
              Start Work
            </Button>
          )}
          
          {workOrder.status === 'in_progress' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('on_hold')}>
                Hold
              </Button>
              <Button size="sm" onClick={() => setShowSignatureCapture(true)}>
                Complete
              </Button>
            </>
          )}
          
          {workOrder.status === 'on_hold' && (
            <Button size="sm" onClick={() => handleStatusChange('in_progress')} className="col-span-2">
              Resume Work
            </Button>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-neutral-900 border-b border-neutral-800 rounded-none w-full grid grid-cols-4">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="items" className="text-xs">Items</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="photos" className="text-xs">Photos</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="details" className="space-y-4 p-4 m-0">
              {/* Customer Info */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white font-medium">{workOrder.customerName}</p>
                  {workOrder.customerPhone && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{workOrder.customerPhone}</span>
                    </div>
                  )}
                  {workOrder.customerEmail && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{workOrder.customerEmail}</span>
                    </div>
                  )}
                  {workOrder.serviceLocation && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{workOrder.serviceLocation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Details */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Work Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-neutral-400 text-sm">Description</p>
                    <p className="text-white">{workOrder.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-neutral-400 text-sm">Type</p>
                      <p className="text-white capitalize">{workOrder.type}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm">Estimated Hours</p>
                      <p className="text-white">{workOrder.estimatedHours}h</p>
                    </div>
                  </div>

                  {workOrder.scheduledDate && (
                    <div>
                      <p className="text-neutral-400 text-sm">Scheduled</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-neutral-400" />
                        <span className="text-white text-sm">
                          {workOrder.scheduledDate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {workOrder.assignedTechnician && (
                    <div>
                      <p className="text-neutral-400 text-sm">Assigned To</p>
                      <p className="text-white">{workOrder.assignedTechnician}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 p-4 m-0">
              {/* Line Items */}
              {workOrder.lineItems && workOrder.lineItems.length > 0 && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workOrder.lineItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.description}</p>
                          <p className="text-neutral-400 text-sm">
                            {item.quantity} × ${item.unitPrice}
                          </p>
                        </div>
                        <p className="text-white font-medium">${item.total?.toFixed(2)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Materials */}
              {workOrder.materials && workOrder.materials.length > 0 && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workOrder.materials.map((material, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{material.name}</p>
                          <p className="text-neutral-400 text-sm">
                            {material.quantity} {material.unit} × ${material.costPerUnit}
                          </p>
                        </div>
                        <p className="text-white font-medium">${material.totalCost?.toFixed(2)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Total */}
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Cost:</span>
                  <span className="text-white font-bold text-lg">${workOrder.totalCost?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 p-4 m-0">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Work Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workOrder.notes && workOrder.notes.length > 0 ? (
                    <div className="space-y-3">
                      {workOrder.notes.map((note, index) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-3">
                          <p className="text-white">{note.content}</p>
                          <p className="text-neutral-400 text-xs mt-1">
                            {note.createdAt?.toLocaleString()} - {note.createdBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400">No notes added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4 p-4 m-0">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => setShowPhotoUpload(true)}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-700"
                  variant="outline"
                >
                  <Camera className="h-6 w-6 mb-2" />
                  <span className="text-xs">Add Photo</span>
                </Button>
                
                {/* Display existing photos */}
                {workOrder.customFields?.photos?.map((photoId, index) => (
                  <div key={index} className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center">
                    <span className="text-neutral-400 text-xs">Photo {index + 1}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Signature Capture Dialog */}
      <Dialog open={showSignatureCapture} onOpenChange={setShowSignatureCapture}>
        <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Customer Signature Required</DialogTitle>
            <DialogDescription>
              Please have the customer sign to complete this work order.
            </DialogDescription>
          </DialogHeader>
          
          <SignatureCapture
            onSave={handleSignatureSave}
            onCancel={() => setShowSignatureCapture(false)}
            title="Work Order Completion"
            signerName={workOrder.customerName}
            required={true}
            width={500}
            height={150}
          />
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
        <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Add Photos</DialogTitle>
            <DialogDescription>
              Capture or upload photos related to this work order.
            </DialogDescription>
          </DialogHeader>
          
          <DocumentUploadWidget
            onUploadComplete={handlePhotoUpload}
            onUploadError={(error) => console.error('Photo upload error:', error)}
            maxFiles={10}
            acceptedTypes={['image/*']}
            defaultCategory="photo"
            relatedEntityId={workOrder.id}
            relatedEntityType="work_order"
            compact={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}