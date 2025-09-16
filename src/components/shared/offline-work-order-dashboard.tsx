'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  Grid,
  List,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Wrench,
  FileText,
  Image,
  Signature,
  PhoneCall,
  Mail,
  Navigation,
  Timer,
  Target,
  Zap,
  Settings,
  MoreHorizontal,
  X,
  ChevronRight,
  ChevronDown,
  Flag,
  ShieldCheck,
  Repeat,
  AlertCircle,
  Building,
  Tool,
  Package,
  Camera,
  MessageSquare,
  PenTool
} from 'lucide-react';

import { useOfflineWorkOrders } from '@/lib/offline-work-order-manager';
import type { 
  WorkOrderMetadata, 
  WorkOrderFilter, 
  WorkOrderSearchResult, 
  WorkOrderStats,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderType
} from '@/lib/offline-work-order-manager';

interface WorkOrderDashboardState {
  workOrders: WorkOrderMetadata[];
  searchResults: WorkOrderSearchResult | null;
  statistics: WorkOrderStats | null;
  loading: boolean;
  error: string | null;
  selectedWorkOrders: Set<string>;
  viewMode: 'grid' | 'list' | 'kanban';
  filter: WorkOrderFilter;
  searchQuery: string;
  selectedWorkOrder: WorkOrderMetadata | null;
  showCreateDialog: boolean;
  showFilters: boolean;
  autoRefresh: boolean;
}

export default function OfflineWorkOrderDashboard() {
  const [state, setState] = useState<WorkOrderDashboardState>({
    workOrders: [],
    searchResults: null,
    statistics: null,
    loading: false,
    error: null,
    selectedWorkOrders: new Set(),
    viewMode: 'grid',
    filter: Record<string, unknown>,
    searchQuery: ',
    selectedWorkOrder: null,
    showCreateDialog: false,
    showFilters: false,
    autoRefresh: true
  });

  const workOrderManager = useOfflineWorkOrders();

  // Load work orders and statistics
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const filter: WorkOrderFilter = {
        ...state.filter,
        searchQuery: state.searchQuery || undefined
      };

      const [searchResults, statistics] = await Promise.all([
        workOrderManager.searchWorkOrders(filter, {
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 100
        }),
        workOrderManager.getStatistics()
      ]);

      setState(prev => ({
        ...prev,
        searchResults,
        statistics,
        workOrders: searchResults.workOrders,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load work orders',
        loading: false
      }));
    }
  }, [workOrderManager, state.filter, state.searchQuery]);

  // Set up event listeners and auto-refresh
  useEffect(() => {
    loadData();

    const handleWorkOrderCreated = () => {
      if (state.autoRefresh) loadData();
    };
    
    const handleWorkOrderUpdated = () => {
      if (state.autoRefresh) loadData();
    };

    const handleStatusChanged = () => {
      if (state.autoRefresh) loadData();
    };

    workOrderManager.on('work_order_created', handleWorkOrderCreated);
    workOrderManager.on('work_order_updated', handleWorkOrderUpdated);
    workOrderManager.on('work_order_status_changed', handleStatusChanged);

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (state.autoRefresh) {
        loadData();
      }
    }, 30000);

    return () => {
      workOrderManager.off('work_order_created', handleWorkOrderCreated);
      workOrderManager.off('work_order_updated', handleWorkOrderUpdated);
      workOrderManager.off('work_order_status_changed', handleStatusChanged);
      clearInterval(refreshInterval);
    };
  }, [loadData, state.autoRefresh, workOrderManager]);

  const getStatusColor = (status: WorkOrderStatus) => {
    const colors = {
      draft: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      dispatched: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      on_hold: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      requires_approval: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      invoiced: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      paid: 'bg-green-600/20 text-green-300 border-green-600/30',
      follow_up_required: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      emergency: 'bg-red-600/20 text-red-300 border-red-600/30'
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'low': return Flag;
      case 'medium': return Flag;
      case 'high': return AlertTriangle;
      case 'urgent': return AlertCircle;
      case 'emergency': return Zap;
      default: return Flag;
    }
  };

  const getStatusIcon = (status: WorkOrderStatus) => {
    switch (status) {
      case 'draft': return Edit;
      case 'scheduled': return Calendar;
      case 'dispatched': return Navigation;
      case 'in_progress': return Activity;
      case 'on_hold': return Pause;
      case 'completed': return CheckCircle;
      case 'cancelled': return X;
      case 'requires_approval': return ShieldCheck;
      case 'approved': return CheckCircle;
      case 'invoiced': return FileText;
      case 'paid': return DollarSign;
      case 'follow_up_required': return PhoneCall;
      default: return ClipboardList;
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m';
    }
    return '${minutes}m';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleStatusUpdate = async (workOrderId: string, newStatus: WorkOrderStatus) => {
    try {
      await workOrderManager.updateStatus(workOrderId, newStatus, 'Status updated to ${newStatus}');
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update status'
      }));
    }
  };

  const handleWorkOrderAction = async (action: string, workOrderId: string) => {
    try {
      switch (action) {
        case 'delete':
          await workOrderManager.deleteWorkOrder(workOrderId);
          break;
        case 'restore':
          await workOrderManager.restoreWorkOrder(workOrderId);
          break;
      }
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to ${action} work order'
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Orders</h1>
          <p className="text-neutral-400">Manage and track all work orders across your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
          <Button variant="outline" onClick={loadData} disabled={state.loading}>
            {state.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
          >
            {state.autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {state.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total Work Orders</p>
                  <p className="text-2xl font-bold text-white">{state.statistics.totalWorkOrders}</p>
                  <p className="text-xs text-neutral-500">
                    {state.statistics.completedWorkOrders} completed
                  </p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {state.statistics.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-neutral-500">
                    {state.statistics.pendingWorkOrders} pending
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Avg Completion</p>
                  <p className="text-2xl font-bold text-white">
                    {formatDuration(state.statistics.averageCompletionTime)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {state.statistics.overdueWorkOrders} overdue
                  </p>
                </div>
                <Timer className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(state.statistics.totalRevenue)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {state.statistics.emergencyWorkOrders} emergency
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search work orders..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={state.filter.status as string || ''} 
                onValueChange={(value) => setState(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, status: value as WorkOrderStatus || undefined }
                }))}
              >
                <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={state.filter.priority as string || ''} 
                onValueChange={(value) => setState(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, priority: value as WorkOrderPriority || undefined }
                }))}
              >
                <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md bg-neutral-800 border-neutral-700">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'kanban' }))}
                  className="rounded-l-none"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Extended Filters */}
          {state.showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-neutral-400">Type</Label>
                  <Select 
                    value={state.filter.type as string || ''} 
                    onValueChange={(value) => setState(prev => ({ 
                      ...prev, 
                      filter: { ...prev.filter, type: value as WorkOrderType || undefined }
                    }))}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-neutral-400">Emergency Only</Label>
                  <Select 
                    value={state.filter.isEmergency?.toString() || ''} 
                    onValueChange={(value) => setState(prev => ({ 
                      ...prev, 
                      filter: { ...prev.filter, isEmergency: value === 'true' ? true : undefined }
                    }))}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All Work Orders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Work Orders</SelectItem>
                      <SelectItem value="true">Emergency Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-neutral-400">Sync Status</Label>
                  <Select 
                    value={state.filter.isSynced?.toString() || ''} 
                    onValueChange={(value) => setState(prev => ({ 
                      ...prev, 
                      filter: { ...prev.filter, isSynced: value === 'true' ? true : value === 'false' ? false : undefined }
                    }))}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Synced</SelectItem>
                      <SelectItem value="false">Pending Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <div className="space-y-4">
        {state.searchResults && (
          <div className="flex items-center justify-between">
            <p className="text-neutral-400">
              {state.searchResults.totalCount} work orders found
              {state.searchResults.totalValue > 0 && (
                <span> • {formatCurrency(state.searchResults.totalValue)} total value</span>
              )}
            </p>
          </div>
        )}

        {state.viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.workOrders.map(workOrder => {
              const StatusIcon = getStatusIcon(workOrder.status);
              const PriorityIcon = getPriorityIcon(workOrder.priority);
              
              return (
                <Card 
                  key={workOrder.id} 
                  className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, selectedWorkOrder: workOrder }))}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-blue-500" />
                          <span className="font-medium text-white text-sm">{workOrder.number}</span>
                          {workOrder.isEmergency && (
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                              <Zap className="h-3 w-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setState(prev => ({ ...prev, selectedWorkOrder: workOrder }));
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Title and Customer */}
                      <div>
                        <h3 className="text-white font-medium text-sm truncate" title={workOrder.title}>
                          {workOrder.title}
                        </h3>
                        <p className="text-neutral-400 text-xs truncate">
                          {workOrder.customerName}
                        </p>
                      </div>

                      {/* Status and Priority Badges */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {workOrder.priority}
                        </Badge>
                      </div>

                      {/* Schedule and Location */}
                      <div className="space-y-1 text-xs text-neutral-400">
                        {workOrder.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(workOrder.scheduledAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {workOrder.serviceAddress.city}, {workOrder.serviceAddress.state}
                          </span>
                        </div>
                        {workOrder.assignedTechnicians.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{workOrder.assignedTechnicians.length} assigned</span>
                          </div>
                        )}
                      </div>

                      {/* Value and Sync Status */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {workOrder.estimatedCost && (
                            <span className="text-green-400">
                              {formatCurrency(workOrder.estimatedCost, workOrder.currency)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!workOrder.isSynced && (
                            <Badge variant="outline" className="text-xs">
                              {workOrder.syncStatus}
                            </Badge>
                          )}
                          {workOrder.isRecurring && (
                            <Repeat className="h-3 w-3 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : state.viewMode === 'list' ? (
          <div className="space-y-2">
            {state.workOrders.map(workOrder => {
              const StatusIcon = getStatusIcon(workOrder.status);
              const PriorityIcon = getPriorityIcon(workOrder.priority);
              
              return (
                <Card 
                  key={workOrder.id} 
                  className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, selectedWorkOrder: workOrder }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-6 w-6 text-blue-500" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium truncate">{workOrder.number}</h3>
                          {workOrder.isEmergency && (
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                              <Zap className="h-3 w-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                          {workOrder.isRecurring && (
                            <Repeat className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                        
                        <p className="text-white text-sm truncate mb-1">{workOrder.title}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>{workOrder.customerName}</span>
                          <span>{workOrder.serviceAddress.city}, {workOrder.serviceAddress.state}</span>
                          {workOrder.scheduledAt && (
                            <span>{formatDate(workOrder.scheduledAt)}</span>
                          )}
                          <span>{workOrder.assignedTechnicians.length} tech(s)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {workOrder.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                        {workOrder.estimatedCost && (
                          <span className="text-green-400 font-medium">
                            {formatCurrency(workOrder.estimatedCost, workOrder.currency)}
                          </span>
                        )}
                        {!workOrder.isSynced && (
                          <Badge variant="outline" className="text-xs">
                            {workOrder.syncStatus}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setState(prev => ({ ...prev, selectedWorkOrder: workOrder }));
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Kanban view placeholder
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">Kanban view coming soon</p>
          </div>
        )}

        {state.workOrders.length === 0 && !state.loading && (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">No work orders found</p>
              <p className="text-neutral-500 text-sm">Create your first work order to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Work Order Details Dialog */}
      {state.selectedWorkOrder && (
        <Dialog 
          open={!!state.selectedWorkOrder} 
          onOpenChange={() => setState(prev => ({ ...prev, selectedWorkOrder: null }))}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {state.selectedWorkOrder.number} - {state.selectedWorkOrder.title}
                {state.selectedWorkOrder.isEmergency && (
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Work order details and management
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-neutral-800">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="attachments">Files</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-neutral-400">Name:</span>
                        <span className="text-white ml-2">{state.selectedWorkOrder.customerName}</span>
                      </div>
                      {state.selectedWorkOrder.customerEmail && (
                        <div>
                          <span className="text-neutral-400">Email:</span>
                          <span className="text-white ml-2">{state.selectedWorkOrder.customerEmail}</span>
                        </div>
                      )}
                      {state.selectedWorkOrder.customerPhone && (
                        <div>
                          <span className="text-neutral-400">Phone:</span>
                          <span className="text-white ml-2">{state.selectedWorkOrder.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Schedule & Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Status:</span>
                        <Badge variant="outline" className={getStatusColor(state.selectedWorkOrder.status)}>
                          {state.selectedWorkOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Priority:</span>
                        <Badge variant="outline" className={getPriorityColor(state.selectedWorkOrder.priority)}>
                          {state.selectedWorkOrder.priority}
                        </Badge>
                      </div>
                      {state.selectedWorkOrder.scheduledAt && (
                        <div>
                          <span className="text-neutral-400">Scheduled:</span>
                          <span className="text-white ml-2">
                            {state.selectedWorkOrder.scheduledAt.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Service Address</h4>
                  <div className="text-sm text-white">
                    {state.selectedWorkOrder.serviceAddress.street}<br />
                    {state.selectedWorkOrder.serviceAddress.city}, {state.selectedWorkOrder.serviceAddress.state} {state.selectedWorkOrder.serviceAddress.zipCode}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Description</h4>
                  <p className="text-sm text-white">{state.selectedWorkOrder.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(state.selectedWorkOrder!.id, 'in_progress')}
                    disabled={state.selectedWorkOrder.status === 'in_progress'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(state.selectedWorkOrder!.id, 'completed')}
                    disabled={state.selectedWorkOrder.status === 'completed'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(state.selectedWorkOrder!.id, 'on_hold')}
                    disabled={state.selectedWorkOrder.status === 'on_hold'}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Hold
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-4">Line Items</h4>
                  {state.selectedWorkOrder.lineItems.length === 0 ? (
                    <p className="text-neutral-400 text-sm">No line items added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {state.selectedWorkOrder.lineItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{item.description}</p>
                            <p className="text-neutral-400 text-sm">Qty: {item.quantity} @ {formatCurrency(item.unitPrice)}</p>
                          </div>
                          <span className="text-white font-medium">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-white font-medium mb-4">Materials</h4>
                  {state.selectedWorkOrder.materials.length === 0 ? (
                    <p className="text-neutral-400 text-sm">No materials listed</p>
                  ) : (
                    <div className="space-y-2">
                      {state.selectedWorkOrder.materials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{material.name}</p>
                            <p className="text-neutral-400 text-sm">
                              Qty: {material.quantity} {material.unit} @ {formatCurrency(material.unitCost)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-medium">{formatCurrency(material.totalCost)}</span>
                            {material.used && (
                              <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                                Used
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Notes & Comments</h4>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {state.selectedWorkOrder.notes.length === 0 ? (
                  <p className="text-neutral-400 text-sm">No notes added yet</p>
                ) : (
                  <div className="space-y-3">
                    {state.selectedWorkOrder.notes.map(note => (
                      <div key={note.id} className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-neutral-400 text-sm">
                            {note.createdAt.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {note.type}
                          </Badge>
                          {note.importance !== 'medium' && (
                            <Badge variant="outline" className="text-xs">
                              {note.importance}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white text-sm">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {note.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Attachments</h4>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photo
                    </Button>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Photos */}
                  {state.selectedWorkOrder.photos.length > 0 && (
                    <div className="col-span-3">
                      <h5 className="text-white font-medium mb-2">Photos</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {state.selectedWorkOrder.photos.map((photoId, index) => (
                          <div key={photoId} className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center">
                            <Image className="h-8 w-8 text-neutral-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {state.selectedWorkOrder.attachments.length > 0 && (
                    <div className="col-span-3">
                      <h5 className="text-white font-medium mb-2">Documents</h5>
                      <div className="space-y-2">
                        {state.selectedWorkOrder.attachments.map((docId, index) => (
                          <div key={docId} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-white text-sm">Document {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  {state.selectedWorkOrder.signatures.length > 0 && (
                    <div className="col-span-3">
                      <h5 className="text-white font-medium mb-2">Signatures</h5>
                      <div className="space-y-2">
                        {state.selectedWorkOrder.signatures.map(signature => (
                          <div key={signature.id} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                            <PenTool className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                              <span className="text-white text-sm">{signature.signedBy}</span>
                              <p className="text-neutral-400 text-xs">{signature.purpose}</p>
                            </div>
                            <span className="text-neutral-400 text-xs">
                              {signature.signedAt.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.selectedWorkOrder.photos.length === 0 && 
                   state.selectedWorkOrder.attachments.length === 0 && 
                   state.selectedWorkOrder.signatures.length === 0 && (
                    <div className="col-span-3 text-center py-8">
                      <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                      <p className="text-neutral-400">No attachments yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <h4 className="text-white font-medium">Work Order History</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Work order created</p>
                      <p className="text-neutral-400 text-xs">{state.selectedWorkOrder.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {state.selectedWorkOrder.actualStartTime && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Work started</p>
                        <p className="text-neutral-400 text-xs">{state.selectedWorkOrder.actualStartTime.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {state.selectedWorkOrder.completedAt && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Work completed</p>
                        <p className="text-neutral-400 text-xs">{state.selectedWorkOrder.completedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}