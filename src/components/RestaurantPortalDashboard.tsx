'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ShoppingCart,
  Truck,
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestaurantPortalDashboardProps {
  portalAccess: any;
  customer: any;
  accessToken: string;
}

export default function RestaurantPortalDashboard({
  portalAccess,
  customer,
  accessToken,
}: RestaurantPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const primaryColor = portalAccess.branding?.primary_color || '#FF6B35';
  const permissions = portalAccess.permissions || {};

  useEffect(() => {
    // Simulate loading recent orders
    setTimeout(() => {
      setRecentOrders([
        {
          id: '1',
          orderNumber: 'RO-2024-001',
          status: 'delivered',
          items: ['Fresh Salmon 20lbs', 'Organic Vegetables Mix', 'Artisan Bread 12 loaves'],
          total: 245.80,
          deliveryDate: '2024-01-15',
          supplier: 'Fresh Foods Co.',
        },
        {
          id: '2',
          orderNumber: 'RO-2024-002',
          status: 'in_transit',
          items: ['Prime Beef 15lbs', 'Pasta Varieties', 'Olive Oil 2L'],
          total: 312.50,
          deliveryDate: '2024-01-16',
          supplier: 'Gourmet Supplies',
        },
        {
          id: '3',
          orderNumber: 'RO-2024-003',
          status: 'pending',
          items: ['Coffee Beans 5lbs', 'Dairy Products', 'Cleaning Supplies'],
          total: 156.25,
          deliveryDate: '2024-01-17',
          supplier: 'Restaurant Essentials',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_transit': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back, {customer.company_name || '${customer.first_name} ${customer.last_name}'}!
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your restaurant supplies, orders, and services from your personalized portal.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: primaryColor }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">3</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: primaryColor }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  This Month's Spending
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">$2,485</p>
              </div>
              <DollarSign className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: primaryColor }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Deliveries This Week
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">8</p>
              </div>
              <Truck className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: primaryColor }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Supplier Rating
                </p>
                <div className="flex items-center space-x-1">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">4.8</p>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu-planning">Menu Planning</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Orders
                  {permissions.can_place_orders && (
                    <Button size="sm" style={{ backgroundColor: primaryColor }}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your latest supply orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  recentOrders.map((order: unknown) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getStatusColor(order.status)
                            )}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">
                              {order.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                          {order.items.join(', ')}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500">
                            {order.supplier}
                          </span>
                          <span className="font-medium">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                  Upcoming Deliveries
                </CardTitle>
                <CardDescription>
                  Scheduled deliveries for this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Fresh Produce Delivery</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Tomorrow, 8:00 AM - 10:00 AM
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                      Confirmed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Meat & Seafood Order</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Thursday, 6:00 AM - 8:00 AM
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                      Pending
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Beverages & Supplies</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Friday, 2:00 PM - 4:00 PM
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                      Scheduled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used actions for your restaurant management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {permissions.can_place_orders && (
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-sm">Place Order</span>
                  </Button>
                )}

                {permissions.can_view_invoices && (
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Receipt className="h-6 w-6" />
                    <span className="text-sm">View Invoices</span>
                  </Button>
                )}

                {permissions.can_communicate_with_account_manager && (
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Contact Support</span>
                  </Button>
                )}

                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Schedule Delivery</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage all your restaurant supply orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Order Management System
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Advanced order management features coming soon
                </p>
                {permissions.can_place_orders && (
                  <Button style={{ backgroundColor: primaryColor }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu-planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Planning Assistant</CardTitle>
              <CardDescription>
                Plan your menu and get ingredient recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  AI-Powered Menu Planning
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Get personalized menu suggestions and ingredient optimization
                </p>
                <Button style={{ backgroundColor: primaryColor }}>
                  Start Menu Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                View and manage your restaurant invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Invoice & Payment Center
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Access your billing history and payment options
                </p>
                {permissions.can_view_invoices && (
                  <Button style={{ backgroundColor: primaryColor }}>
                    View All Invoices
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Support</CardTitle>
              <CardDescription>
                Get help with your restaurant supply needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  24/7 Restaurant Support
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Connect with our restaurant supply specialists
                </p>
                {permissions.can_communicate_with_account_manager && (
                  <div className="space-x-4">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Chat with Support
                    </Button>
                    <Button variant="outline">
                      Call Support
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}