'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  Star,
  RefreshCw,
  Gift,
  Heart,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Tag,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetailPortalDashboardProps {
  portalAccess: any;
  customer: any;
  accessToken: string;
}

interface Order {
  id: string;
  order_number: string;
  order_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items_count: number;
  tracking_number?: string;
  estimated_delivery?: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  category: string;
  is_favorited: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface LoyaltyProgram {
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  next_tier_points: number;
  lifetime_spent: number;
  rewards_available: number;
}

export default function RetailPortalDashboard({ 
  portalAccess, 
  customer, 
  accessToken 
}: RetailPortalDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customer data
    setTimeout(() => {
      // Mock data - in real implementation, fetch from API
      setOrders([
        {
          id: '1',
          order_number: 'ORD-2024-001',
          order_date: '2024-01-20',
          status: 'delivered',
          total: 149.99,
          items_count: 3,
          tracking_number: 'TRK123456789',
        },
        {
          id: '2',
          order_number: 'ORD-2024-002',
          order_date: '2024-01-18',
          status: 'shipped',
          total: 89.50,
          items_count: 2,
          tracking_number: 'TRK987654321',
          estimated_delivery: '2024-01-25'
        },
        {
          id: '3',
          order_number: 'ORD-2024-003',
          order_date: '2024-01-15',
          status: 'processing',
          total: 299.99,
          items_count: 1,
        }
      ]);

      setFavoriteProducts([
        {
          id: '1',
          name: 'Premium Bluetooth Headphones',
          image_url: '/placeholder-product.jpg',
          price: 199.99,
          category: 'Electronics',
          is_favorited: true,
          stock_status: 'in_stock'
        },
        {
          id: '2',
          name: 'Organic Cotton T-Shirt',
          image_url: '/placeholder-product.jpg',
          price: 29.99,
          category: 'Clothing',
          is_favorited: true,
          stock_status: 'low_stock'
        },
        {
          id: '3',
          name: 'Stainless Steel Water Bottle',
          image_url: '/placeholder-product.jpg',
          price: 24.99,
          category: 'Lifestyle',
          is_favorited: true,
          stock_status: 'in_stock'
        }
      ]);

      setLoyaltyProgram({
        points_balance: 2450,
        tier: 'silver',
        next_tier_points: 550,
        lifetime_spent: 1247.50,
        rewards_available: 3
      });

      setLoading(false);
    }, 1000);
  }, [accessToken]);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low_stock': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'out_of_stock': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 dark:text-amber-400';
      case 'silver': return 'text-neutral-600 dark:text-neutral-400';
      case 'gold': return 'text-yellow-600 dark:text-yellow-400';
      case 'platinum': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
          Welcome back, {customer.first_name || customer.company_name}!
        </h2>
        <p className="text-green-700 dark:text-green-300">
          Discover new products and track your orders
        </p>
        {loyaltyProgram && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className={cn("h-5 w-5", getTierColor(loyaltyProgram.tier))} />
              <span className={cn("font-medium capitalize", getTierColor(loyaltyProgram.tier))}>
                {loyaltyProgram.tier} Member
              </span>
            </div>
            <div className="text-green-700 dark:text-green-300">
              {loyaltyProgram.points_balance} points available
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Favorite Items</p>
                <p className="text-2xl font-bold">{favoriteProducts.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Loyalty Points</p>
                <p className="text-2xl font-bold">{loyaltyProgram?.points_balance || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {order.order_date} • {order.items_count} item{order.items_count !== 1 ? 's' : '}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setActiveTab('orders')}>
                  View All Orders
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Favorite Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Favorites
              </CardTitle>
              <CardDescription>Products you love</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {favoriteProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h4 className="font-medium mb-1">{product.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        {getStockStatusIcon(product.stock_status)}
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                          {product.stock_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Track all your purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{order.order_number}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {order.order_date} • {order.items_count} item{order.items_count !== 1 ? 's' : '}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {order.tracking_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <span>Tracking: {order.tracking_number}</span>
                        {order.estimated_delivery && (
                          <span className="text-neutral-600 dark:text-neutral-400">
                            • Estimated delivery: {order.estimated_delivery}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Products</CardTitle>
              <CardDescription>Your wishlisted items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-neutral-400" />
                    </div>
                    <h4 className="font-medium mb-2">{product.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{product.category}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        {getStockStatusIcon(product.stock_status)}
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                          {product.stock_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled={product.stock_status === 'out_of_stock'}>
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          {loyaltyProgram && (
            <>
              {/* Loyalty Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className={cn("h-5 w-5", getTierColor(loyaltyProgram.tier))} />
                    Loyalty Program
                  </CardTitle>
                  <CardDescription>Your membership status and rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Current Tier</p>
                      <p className={cn("text-2xl font-bold capitalize", getTierColor(loyaltyProgram.tier))}>
                        {loyaltyProgram.tier}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Points Balance</p>
                      <p className="text-2xl font-bold">{loyaltyProgram.points_balance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Lifetime Spent</p>
                      <p className="text-2xl font-bold">${loyaltyProgram.lifetime_spent.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Progress to Next Tier */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress to next tier</span>
                      <span>{loyaltyProgram.next_tier_points} points needed</span>
                    </div>
                    <Progress 
                      value={((3000 - loyaltyProgram.next_tier_points) / 3000) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Available Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-500" />
                    Available Rewards
                  </CardTitle>
                  <CardDescription>Redeem your points for great rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">$10 Off Next Order</h4>
                        <Badge variant="secondary">500 pts</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Use on orders over $50
                      </p>
                      <Button size="sm" className="w-full">Redeem</Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Free Shipping</h4>
                        <Badge variant="secondary">750 pts</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Free shipping on next order
                      </p>
                      <Button size="sm" className="w-full">Redeem</Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">20% Off Sale Items</h4>
                        <Badge variant="secondary">1000 pts</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Extra discount on sale items
                      </p>
                      <Button size="sm" className="w-full">Redeem</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Tag className="h-4 w-4" />
              View Sale Items
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Gift className="h-4 w-4" />
              Gift Cards
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Store Locator
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}