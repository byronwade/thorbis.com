"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  CreditCard,
  Receipt,
  Search,
  Plus,
  Minus,
  X,
  Calculator,
  Printer,
  QrCode,
  Barcode
} from 'lucide-react';

export default function RetailPOS() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  // Mock product data
  const products = [
    { id: 1, name: "Premium T-Shirt", price: 29.99, category: "Clothing", stock: 45, sku: "TSH-001" },
    { id: 2, name: "Denim Jeans", price: 89.99, category: "Clothing", stock: 23, sku: "JNS-002" },
    { id: 3, name: "Wireless Headphones", price: 79.99, category: "Electronics", stock: 12, sku: "HPH-003" },
    { id: 4, name: "Designer Bag", price: 129.99, category: "Accessories", stock: 8, sku: "BAG-004" },
    { id: 5, name: "Sneakers", price: 119.99, category: "Footwear", stock: 15, sku: "SNK-005" },
    { id: 6, name: "Hoodie", price: 59.99, category: "Clothing", stock: 32, sku: "HOD-006" },
    { id: 7, name: "Baseball Cap", price: 24.99, category: "Accessories", stock: 28, sku: "CAP-007" },
    { id: 8, name: "Smart Watch", price: 199.99, category: "Electronics", stock: 6, sku: "WCH-008" }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTax = () => {
    return getCartTotal() * 0.08; // 8% tax
  };

  const getCartGrandTotal = () => {
    return getCartTotal() + getCartTax();
  };

  const processTransaction = () => {
    // Mock transaction processing
    alert(`Transaction completed! Total: $${getCartGrandTotal().toFixed(2)}`);
    setCart([]);
  };

  return (
    <div className="h-screen flex">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
          <p className="text-gray-600 mt-1">Point of Sale - Process transactions quickly</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.sku}</p>
                    <p className="text-lg font-bold text-green-600">${product.price}</p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {product.stock} in stock
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="text-gray-600 text-sm">Current transaction</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start a transaction</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-600">{item.sku}</p>
                    <p className="text-sm font-bold text-green-600">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${getCartTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${getCartGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Payment Method</h4>
              <div className="flex space-x-2">
                <Button
                  variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPaymentMethod('card')}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPaymentMethod('cash')}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Cash
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPaymentMethod('mobile')}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={processTransaction}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1" />
                  Print Receipt
                </Button>
                <Button variant="outline" size="sm">
                  <Calculator className="w-4 h-4 mr-1" />
                  Calculate Change
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
