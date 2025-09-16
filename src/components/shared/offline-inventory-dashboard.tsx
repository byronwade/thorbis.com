'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  DollarSign,
  Warehouse,
  ShoppingCart,
  Package2,
  Truck,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  WifiOff,
  Sync,
  Clock,
  AlertCircle,
  Activity,
  Database,
  X
} from 'lucide-react';

import { useOfflineInventory } from '@/lib/offline-inventory-manager';
import type { InventoryItem, InventoryChange, InventoryStats } from '@/lib/offline-inventory-manager';

interface InventoryState {
  items: InventoryItem[];
  changes: InventoryChange[];
  statistics: InventoryStats;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  selectedItem: InventoryItem | null;
  searchTerm: string;
  filterCategory: string;
  filterIndustry: string;
  showLowStock: boolean;
}

interface NewItemForm {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  supplier: string;
  location: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses';
}

export default function OfflineInventoryDashboard() {
  const [state, setState] = useState<InventoryState>({
    items: [],
    changes: [],
    statistics: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingChanges: 0,
      unsynced: 0,
      conflicts: 0,
      categories: Record<string, unknown>,
      valueByCategory: Record<string, unknown>
    },
    loading: false,
    syncing: false,
    error: null,
    selectedItem: null,
    searchTerm: ',
    filterCategory: ',
    filterIndustry: ',
    showLowStock: false
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    sku: ',
    name: ',
    description: ',
    category: ',
    price: 0,
    cost: 0,
    quantity: 0,
    lowStockThreshold: 5,
    reorderPoint: 10,
    supplier: ',
    location: 'main',
    industry: 'hs'
  });

  const [adjustment, setAdjustment] = useState({
    itemId: ',
    quantity: 0,
    reason: ',
    type: 'adjustment' as 'adjustment' | 'sale' | 'purchase'
  });

  const inventory = useOfflineInventory();

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Set up event listeners
    inventory.on('item_added', loadData);
    inventory.on('item_updated', loadData);
    inventory.on('stock_adjusted', loadData);
    inventory.on('sale_recorded', loadData);
    inventory.on('purchase_recorded', loadData);
    inventory.on('sync_completed', handleSyncCompleted);
    inventory.on('sync_failed', handleSyncFailed);

    return () => {
      inventory.off('item_added', loadData);
      inventory.off('item_updated', loadData);
      inventory.off('stock_adjusted', loadData);
      inventory.off('sale_recorded', loadData);
      inventory.off('purchase_recorded', loadData);
      inventory.off('sync_completed', handleSyncCompleted);
      inventory.off('sync_failed', handleSyncFailed);
    };
  }, []);

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const items = inventory.getItems({
        organizationId: 'org_test',
        search: state.searchTerm || undefined,
        category: state.filterCategory || undefined,
        industry: state.filterIndustry as any || undefined,
        lowStock: state.showLowStock || undefined
      });
      
      const changes = inventory.getChanges({ unsynced: true });
      const statistics = await inventory.getStatistics('org_test');
      
      setState(prev => ({
        ...prev,
        items,
        changes,
        statistics,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load inventory data',
        loading: false
      }));
    }
  }, [state.searchTerm, state.filterCategory, state.filterIndustry, state.showLowStock]);

  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddItem = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await inventory.addItem({
        ...newItem,
        reservedQuantity: 0,
        organizationId: 'org_test',
        isActive: true
      });

      setNewItem({
        sku: ',
        name: ',
        description: ',
        category: ',
        price: 0,
        cost: 0,
        quantity: 0,
        lowStockThreshold: 5,
        reorderPoint: 10,
        supplier: ',
        location: 'main',
        industry: 'hs'
      });
      setShowAddForm(false);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add item'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStockAdjustment = async () => {
    if (!adjustment.itemId || adjustment.quantity === 0) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      switch (adjustment.type) {
        case 'adjustment':
          await inventory.adjustStock(adjustment.itemId, adjustment.quantity, adjustment.reason);
          break;
        case 'sale':
          await inventory.recordSale(adjustment.itemId, Math.abs(adjustment.quantity), 'customer_test');
          break;
        case 'purchase':
          const item = inventory.getItem(adjustment.itemId);
          await inventory.recordPurchase(
            adjustment.itemId, 
            Math.abs(adjustment.quantity), 
            item?.cost || 0,
            'supplier_test'
          );
          break;
      }

      setAdjustment({ itemId: ', quantity: 0, reason: ', type: 'adjustment' });
      setShowAdjustForm(false);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to adjust stock'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSync = async () => {
    setState(prev => ({ ...prev, syncing: true, error: null }));
    
    try {
      const result = await inventory.syncWithServer();
      
      if (result.errors.length > 0) {
        setState(prev => ({ ...prev, error: result.errors.join(', ') }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    } finally {
      setState(prev => ({ ...prev, syncing: false }));
    }
  };

  const handleSyncCompleted = (result: unknown) => {
    setState(prev => ({ ...prev, syncing: false }));
    loadData();
  };

  const handleSyncFailed = (error: unknown) => {
    setState(prev => ({ 
      ...prev, 
      syncing: false,
      error: error.error || 'Sync failed'
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.quantity === 0) return 'text-red-500';
    if (item.quantity <= item.lowStockThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStockStatusIcon = (item: InventoryItem) => {
    if (item.quantity === 0) return AlertTriangle;
    if (item.quantity <= item.lowStockThreshold) return TrendingDown;
    return CheckCircle;
  };

  const categories = ['Electronics', 'Tools', 'Parts', 'Supplies', 'Equipment', 'Materials'];
  const industries = [
    { value: 'hs', label: 'Home Services' },
    { value: 'rest', label: 'Restaurant' },
    { value: 'auto', label: 'Auto Services' },
    { value: 'ret', label: 'Retail' },
    { value: 'courses', label: 'Courses' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offline Inventory Management</h1>
          <p className="text-neutral-400">Track stock, movements, and sync with intelligent conflict resolution</p>
        </div>
        <div className="flex items-center gap-2">
          {!navigator.onLine && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline Mode
            </Badge>
          )}
          {state.statistics.unsynced > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {state.statistics.unsynced} Unsynced
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={state.syncing || !navigator.onLine}
          >
            {state.syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sync className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Items</p>
                <p className="text-2xl font-bold text-white">{state.statistics.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(state.statistics.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-500">{state.statistics.lowStockItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">{state.statistics.outOfStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-800">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sync">Sync & Conflicts</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-white">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search items..."
                    value={state.searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={state.filterCategory} onValueChange={(value) => setState(prev => ({ ...prev, filterCategory: value }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry" className="text-white">Industry</Label>
                  <Select value={state.filterIndustry} onValueChange={(value) => setState(prev => ({ ...prev, filterIndustry: value }))}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant={state.showLowStock ? "default" : "outline"}
                    onClick={() => setState(prev => ({ ...prev, showLowStock: !prev.showLowStock }))}
                    className="w-full"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Low Stock Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Inventory Items</CardTitle>
              <CardDescription>Manage your inventory with offline capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              {state.loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin mb-2" />
                  <p className="text-neutral-400">Loading inventory...</p>
                </div>
              ) : state.items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">No inventory items found</p>
                  <Button onClick={() => setShowAddForm(true)} className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.items.map(item => {
                    const StatusIcon = getStockStatusIcon(item);
                    const statusColor = getStockStatusColor(item);
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                      >
                        <div className="flex items-center gap-4">
                          <StatusIcon className={'h-6 w-6 ${statusColor}'} />
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{item.name}</p>
                              <Badge variant="outline" className="text-xs">{item.sku}</Badge>
                              <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                              <span>Qty: {item.quantity}</span>
                              <span>Available: {item.availableQuantity}</span>
                              <span>Cost: {formatCurrency(item.cost)}</span>
                              <span>Price: {formatCurrency(item.price)}</span>
                              <span>Location: {item.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.quantity <= item.lowStockThreshold && (
                            <Badge variant="destructive" className="text-xs">
                              {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAdjustment(prev => ({ ...prev, itemId: item.id }));
                              setShowAdjustForm(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Stock Movements</CardTitle>
              <CardDescription>Track all inventory changes and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {state.changes.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400">No stock movements recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.changes.slice(0, 10).map(change => {
                    const item = state.items.find(i => i.id === change.itemId);
                    
                    return (
                      <div
                        key={change.id}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className={'w-2 h-2 rounded-full ${
                            change.quantityChange > 0 ? 'bg-green-500' : 'bg-red-500'
                          }'} />
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{item?.name || 'Unknown Item'}</p>
                              <Badge variant="outline" className="text-xs">{change.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                              <span>Change: {change.quantityChange > 0 ? '+' : '}{change.quantityChange}</span>
                              <span>New Qty: {change.newQuantity}</span>
                              <span>Value: {formatCurrency(change.totalValue)}</span>
                              <span>{formatDate(change.timestamp)}</span>
                            </div>
                            {change.reason && (
                              <p className="text-xs text-neutral-500 mt-1">{change.reason}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!change.isSynced && (
                            <Badge variant="secondary" className="text-xs">
                              {change.isOffline ? 'Offline' : 'Pending'}
                            </Badge>
                          )}
                          {change.isSynced && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(state.statistics.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-neutral-400">{category}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / state.statistics.totalItems) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-white text-sm">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(state.statistics.valueByCategory).map(([category, value]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-neutral-400">{category}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(value / state.statistics.totalValue) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-white text-sm">{formatCurrency(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sync & Conflicts Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Sync Status</CardTitle>
              <CardDescription>Monitor synchronization and resolve conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Pending Changes</p>
                  <p className="text-xl font-bold text-white">{state.statistics.pendingChanges}</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Unsynced Items</p>
                  <p className="text-xl font-bold text-white">{state.statistics.unsynced}</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">Conflicts</p>
                  <p className="text-xl font-bold text-white">{state.statistics.conflicts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Form */}
      {showAddForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Add New Inventory Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku" className="text-white">SKU</Label>
                <Input
                  id="sku"
                  value={newItem.sku}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry" className="text-white">Industry</Label>
                <Select value={newItem.industry} onValueChange={(value: unknown) => setNewItem(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost" className="text-white">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newItem.cost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-white">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="quantity" className="text-white">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold" className="text-white">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={newItem.lowStockThreshold}
                  onChange={(e) => setNewItem(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddItem} disabled={state.loading} className="flex-1">
                {state.loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Form */}
      {showAdjustForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Stock Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adjustmentType" className="text-white">Type</Label>
                <Select 
                  value={adjustment.type} 
                  onValueChange={(value: unknown) => setAdjustment(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                    <SelectItem value="sale">Record Sale</SelectItem>
                    <SelectItem value="purchase">Record Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="adjustmentQuantity" className="text-white">Quantity</Label>
                <Input
                  id="adjustmentQuantity"
                  type="number"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="adjustmentReason" className="text-white">Reason</Label>
                <Input
                  id="adjustmentReason"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleStockAdjustment} disabled={state.loading} className="flex-1">
                {state.loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                Apply Adjustment
              </Button>
              <Button variant="outline" onClick={() => setShowAdjustForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
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