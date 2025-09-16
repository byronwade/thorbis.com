import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Percent,
  Receipt,
  Search,
  ScanLine,
  Grid,
  Package
} from 'lucide-react'


interface Product {
  id: string
  name: string
  sku: string
  price: number
  category: string
  brand?: string
  image?: string
  available: boolean
  stock: number
}

interface CartItem {
  id: string
  productId: string
  sku: string
  name: string
  price: number
  quantity: number
  total: number
  discount?: number
}

interface Transaction {
  id?: string
  items: CartItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  customer?: {
    name: string
    loyaltyId?: string
    points?: number
  }
}

export default function RetailPOSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState(')
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>({
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Mock product catalog
      const items: Product[] = [
        {
          id: '1',
          name: 'Wireless Headphones',
          sku: 'WH-001',
          price: 199.99,
          category: 'electronics',
          brand: 'TechBrand',
          available: true,
          stock: 45
        },
        {
          id: '2',
          name: 'Cotton T-Shirt',
          sku: 'CT-001',
          price: 24.99,
          category: 'clothing',
          brand: 'EcoWear',
          available: true,
          stock: 120
        },
        {
          id: '3',
          name: 'Coffee Mug',
          sku: 'CM-001',
          price: 12.99,
          category: 'home_garden',
          available: true,
          stock: 67
        },
        {
          id: '4',
          name: 'Running Shoes',
          sku: 'RS-001',
          price: 89.99,
          category: 'sports_outdoors',
          brand: 'Athletic Co',
          available: true,
          stock: 28
        }
      ]
      
      setProducts(items)
      const uniqueCategories = [...new Set(items.map(item => item.category))]
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = currentTransaction.items.find(item => item.productId === product.id)
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      }
      
      setCurrentTransaction(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }
    calculateTotals()
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    
    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    }))
    calculateTotals()
  }

  const removeItem = (itemId: string) => {
    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
    calculateTotals()
  }

  const calculateTotals = () => {
    setCurrentTransaction(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.total, 0)
      const taxTotal = subtotal * 0.08 // 8% tax rate
      const total = subtotal + taxTotal - prev.discountTotal
      
      return {
        ...prev,
        subtotal,
        taxTotal,
        total
      }
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Point of Sale</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[300px] pl-9 pr-4 py-2 border border-neutral-200 rounded-md dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <Button variant="header" size="sm" className="rounded-lg">
                <ScanLine className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize whitespace-nowrap"
              >
                {category === 'all' ? 'All Products' : category.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${!product.available || product.stock === 0 ? 'opacity-50' : '
              }'}
                onClick={() => (product.available && product.stock > 0) && addToCart(product)}
              >
                <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="h-8 w-8 text-neutral-400" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-sm mb-1 line-clamp-2">{product.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    SKU: {product.sku}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                  </div>
                  {(!product.available || product.stock === 0) && (
                    <div className="text-xs text-red-500 mt-1">
                      {product.stock === 0 ? 'Out of stock' : 'Unavailable'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="w-96 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col">
        {/* Cart Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Sale</h2>
            <Button variant="outline" size="sm">
              New Customer
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-6">
          {currentTransaction.items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Scan or click products to add to sale</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentTransaction.items.map((item) => (
                <div key={item.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.sku} · ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">${item.total.toFixed(2)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Totals */}
        {currentTransaction.items.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${currentTransaction.subtotal.toFixed(2)}</span>
              </div>
              {currentTransaction.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${currentTransaction.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${currentTransaction.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${currentTransaction.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-2 mt-6">
              <Button className="w-full" size="lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Process Payment
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  Cash
                </Button>
                <Button variant="outline" size="sm">
                  <Percent className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Receipt className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Save Sale
                </Button>
                <Button variant="outline" size="sm">
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
