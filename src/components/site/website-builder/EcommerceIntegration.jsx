'use client';

/**
 * E-commerce Integration Component - Stripe integration for website builder
 * Styled with Thorbis design system
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Separator } from '@components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@components/ui/dialog';
import { useToast } from '@components/ui/use-toast';

import { logger } from '@utils/logger';

/**
 * E-commerce Integration Component
 */
export default function EcommerceIntegration({ websiteId, websiteData, onSave }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'USD',
    taxRate: 0,
    shippingEnabled: false,
    freeShippingThreshold: 100,
    paymentMethods: ['card'],
    inventory: {
      trackStock: false,
      lowStockThreshold: 10
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadEcommerceData();
  }, [websiteId]);

  const loadEcommerceData = async () => {
    try {
      setIsLoading(true);
      
      // Mock loading e-commerce data
      const mockProducts = [
        {
          id: 'prod_1',
          name: 'Premium Service Package',
          description: 'Our comprehensive service package for professional businesses',
          price: 299.99,
          currency: 'USD',
          images: ['/api/placeholder/300/300'],
          category: 'Services',
          stock: null, // Service has unlimited stock
          status: 'active',
          featured: true,
          sales: 45,
          revenue: 13499.55
        },
        {
          id: 'prod_2',
          name: 'Consultation Session',
          description: '1-hour consultation with our expert team',
          price: 149.99,
          currency: 'USD',
          images: ['/api/placeholder/300/300'],
          category: 'Consulting',
          stock: null,
          status: 'active',
          featured: false,
          sales: 28,
          revenue: 4199.72
        },
        {
          id: 'prod_3',
          name: 'Digital Marketing Kit',
          description: 'Complete digital marketing resources and templates',
          price: 79.99,
          currency: 'USD',
          images: ['/api/placeholder/300/300'],
          category: 'Digital Products',
          stock: 100,
          status: 'active',
          featured: true,
          sales: 67,
          revenue: 5359.33
        }
      ];

      const mockOrders = [
        {
          id: 'ord_1',
          customer: { name: 'John Smith', email: 'john@example.com' },
          total: 299.99,
          status: 'completed',
          date: '2024-01-15',
          items: [{ product: 'Premium Service Package', quantity: 1, price: 299.99 }]
        },
        {
          id: 'ord_2',
          customer: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          total: 149.99,
          status: 'pending',
          date: '2024-01-14',
          items: [{ product: 'Consultation Session', quantity: 1, price: 149.99 }]
        }
      ];

      setProducts(mockProducts);
      setOrders(mockOrders);
      setStripeConnected(websiteData?.config?.stripeEnabled || false);
      
    } catch (error) {
      logger.error('Failed to load e-commerce data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load e-commerce data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      // Mock Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStripeConnected(true);
      toast({
        title: "Stripe Connected",
        description: "Your Stripe account has been connected successfully!",
      });
      
    } catch (error) {
      logger.error('Stripe connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Stripe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        // Update existing product
        setProducts(prev => prev.map(p => 
          p.id === selectedProduct.id ? { ...selectedProduct, ...productData } : p
        ));
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      } else {
        // Add new product
        const newProduct = {
          id: `prod_${Date.now()}`,
          ...productData,
          status: 'active',
          sales: 0,
          revenue: 0
        };
        setProducts(prev => [...prev, newProduct]);
        toast({
          title: "Product Added",
          description: "New product has been added to your store.",
        });
      }
      
      setShowProductDialog(false);
      setSelectedProduct(null);
      
    } catch (error) {
      logger.error('Failed to save product:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product Deleted",
      description: "Product has been removed from your store.",
    });
  };

  const totalRevenue = products.reduce((sum, product) => sum + (product.revenue || 0), 0);
  const totalSales = products.reduce((sum, product) => sum + (product.sales || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading e-commerce data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe Connection Status */}
      {!stripeConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <CardTitle className="text-yellow-800">Stripe Not Connected</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              Connect your Stripe account to start accepting payments on your website.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleConnectStripe} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Connect Stripe Account
            </Button>
          </CardFooter>
        </Card>
      )}

      {stripeConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Stripe Connected</span>
              <Badge variant="secondary" className="ml-auto">
                Ready for payments
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* E-commerce Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.4% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your product catalog
                  </CardDescription>
                </div>
                <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedProduct(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <ProductDialog 
                    product={selectedProduct}
                    onSave={handleSaveProduct}
                    onClose={() => {
                      setShowProductDialog(false);
                      setSelectedProduct(null);
                    }}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No products yet</p>
                  <p className="text-muted-foreground mb-6">
                    Add your first product to start selling
                  </p>
                  <Button onClick={() => setShowProductDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square bg-muted relative">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        {product.featured && (
                          <Badge className="absolute top-2 left-2">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 mr-1"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-lg font-bold">
                            ${product.price}
                          </div>
                          <Badge variant="outline">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{product.sales} sales</span>
                          <span>${product.revenue?.toFixed(2)} revenue</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-muted-foreground">
                    Orders will appear here when customers make purchases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">#{order.id}</span>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold">${order.total}</div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <p>{order.customer.name} • {order.customer.email}</p>
                        <p>{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.product} × {item.quantity}</span>
                            <span>${item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure your e-commerce store settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Shipping</Label>
                    <p className="text-sm text-muted-foreground">
                      Charge customers for shipping
                    </p>
                  </div>
                  <Switch 
                    checked={settings.shippingEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shippingEnabled: checked }))}
                  />
                </div>

                {settings.shippingEnabled && (
                  <div>
                    <Label htmlFor="free-shipping">Free Shipping Threshold ($)</Label>
                    <Input
                      id="free-shipping"
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) || 0 }))}
                      placeholder="100"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor stock levels for products
                    </p>
                  </div>
                  <Switch 
                    checked={settings.inventory.trackStock}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        inventory: { ...prev.inventory, trackStock: checked }
                      }))
                    }
                  />
                </div>

                {settings.inventory.trackStock && (
                  <div>
                    <Label htmlFor="low-stock">Low Stock Threshold</Label>
                    <Input
                      id="low-stock"
                      type="number"
                      value={settings.inventory.lowStockThreshold}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          inventory: { 
                            ...prev.inventory, 
                            lowStockThreshold: parseInt(e.target.value) || 10 
                          }
                        }))
                      }
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => onSave && onSave({ ecommerceSettings: settings })}
                className="w-full"
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Track your store performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Analytics Coming Soon</p>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Product Dialog Component
 */
function ProductDialog({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    featured: false,
    stock: null
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        images: [],
        featured: false,
        stock: null
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogDescription>
          {product ? 'Update product information' : 'Add a new product to your store'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter product description"
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Enter category"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity (leave empty for unlimited)</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : null }))}
            placeholder="Unlimited"
            min="0"
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Featured Product</Label>
            <p className="text-sm text-muted-foreground">
              Show this product prominently
            </p>
          </div>
          <Switch 
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
