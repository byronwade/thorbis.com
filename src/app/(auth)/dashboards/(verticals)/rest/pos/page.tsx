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
  Users,
  Search,
  Grid,
  List,
  Utensils
} from 'lucide-react'


interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image?: string
  available: boolean
  prepTime: number
}

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  modifications: string[]
  total: number
}

interface CurrentCheck {
  id?: string
  tableNumber?: string
  partySize: number
  items: CartItem[]
  subtotal: number
  tax: number
  tip: number
  discount: number
  total: number
}

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentCheck, setCurrentCheck] = useState<CurrentCheck>({
    partySize: 2,
    items: [],
    subtotal: 0,
    tax: 0,
    tip: 0,
    discount: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      // Mock menu data
      const items: MenuItem[] = [
        {
          id: '1',
          name: 'Caesar Salad',
          price: 12.99,
          category: 'salads',
          available: true,
          prepTime: 8
        },
        {
          id: '2', 
          name: 'Grilled Salmon',
          price: 24.99,
          category: 'entrees',
          available: true,
          prepTime: 15
        },
        {
          id: '3',
          name: 'Chicken Wings',
          price: 14.99,
          category: 'appetizers',
          available: true,
          prepTime: 12
        },
        {
          id: '4',
          name: 'Chocolate Cake',
          price: 8.99,
          category: 'desserts',
          available: true,
          prepTime: 2
        }
      ]
      
      setMenuItems(items)
      const uniqueCategories = [...new Set(items.map(item => item.category))]
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = currentCheck.items.find(item => item.menuItemId === menuItem.id)
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        modifications: [],
        total: menuItem.price
      }
      
      setCurrentCheck(prev => ({
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
    
    setCurrentCheck(prev => ({
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
    setCurrentCheck(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
    calculateTotals()
  }

  const calculateTotals = () => {
    setCurrentCheck(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.total, 0)
      const tax = subtotal * 0.08 // 8% tax rate
      const total = subtotal + tax + prev.tip - prev.discount
      
      return {
        ...prev,
        subtotal,
        tax,
        total
      }
    })
  }

  const filteredMenuItems = menuItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Menu Items Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Point of Sale</h1>
            <div className="flex items-center space-x-4">
              <Button variant="header" size="sm" className="rounded-lg">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="header" size="sm" className="rounded-lg">
                <Grid className="h-4 w-4" />
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
                {category === 'all' ? 'All Items' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className={'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${!item.available ? 'opacity-50' : '
              }'}
                onClick={() => item.available && addToOrder(item)}
              >
                <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Utensils className="h-8 w-8 text-neutral-400" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-sm mb-1">{item.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{item.prepTime}m</span>
                  </div>
                  {!item.available && (
                    <div className="text-xs text-red-500 mt-1">Unavailable</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-96 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col">
        {/* Check Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Current Check</h2>
              <p className="text-sm text-muted-foreground">
                {currentCheck.tableNumber ? 'Table ${currentCheck.tableNumber}' : 'New Order'} · Party of {currentCheck.partySize}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-auto p-6">
          {currentCheck.items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Add items to start an order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentCheck.items.map((item) => (
                <div key={item.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
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
                  <div className="flex justify-between items-center mt-2">
                    {item.modifications.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {item.modifications.join(', ')}
                      </div>
                    )}
                    <div className="font-medium text-sm ml-auto">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Totals */}
        {currentCheck.items.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${currentCheck.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${currentCheck.tax.toFixed(2)}</span>
              </div>
              {currentCheck.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${currentCheck.discount.toFixed(2)}</span>
                </div>
              )}
              {currentCheck.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tip</span>
                  <span>${currentCheck.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${currentCheck.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-6">
              <Button className="w-full" size="lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Process Payment
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Percent className="h-4 w-4 mr-2" />
                  Discount
                </Button>
                <Button variant="outline" size="sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Save & Hold
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}