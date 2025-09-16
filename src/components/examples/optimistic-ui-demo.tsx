'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  OptimisticButton, 
  OptimisticLikeButton, 
  OptimisticQuantitySelector 
} from '@/components/ui/optimistic-button'
import { OptimisticList, OptimisticListItem } from '@/components/ui/optimistic-list'
import { 
  useOptimistic, 
  useOptimisticForm, 
  useOptimisticToggle, 
  useOptimisticCounter 
} from '@/hooks/use-optimistic'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MessageSquare, 
  Share2, 
  Settings,
  Zap,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react'

// =============================================================================
// Sample Data and Mock API Functions
// =============================================================================

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockApiCall = async <T>(data: T, delay: number = 1000, failRate: number = 0.1): Promise<T> => {
  await mockDelay(delay)
  if (Math.random() < failRate) {
    throw new Error('API call failed (simulated)')
  }
  return data
}

interface TodoItem extends OptimisticListItem {
  completed: boolean
}

interface Product {
  id: string
  name: string
  price: number
  liked: boolean
  likeCount: number
  inCart: number
  stock: number
}

// =============================================================================
// Main Demo Component
// =============================================================================

export function OptimisticUIDemo() {
  // State for different demos
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john@example.com' })
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', title: 'Complete project proposal', description: 'Finish the Q4 project proposal document', completed: false },
    { id: '2', title: 'Review pull requests', description: 'Review pending PRs from the team', completed: true },
    { id: '3', title: 'Update documentation', description: 'Update API documentation with new endpoints', completed: false }
  ])
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Wireless Headphones', price: 99.99, liked: false, likeCount: 42, inCart: 0, stock: 15 },
    { id: '2', name: 'Smart Watch', price: 199.99, liked: true, likeCount: 128, inCart: 1, stock: 8 },
    { id: '3', name: 'Bluetooth Speaker', price: 79.99, liked: false, likeCount: 63, inCart: 0, stock: 23 }
  ])

  // Mock API functions
  const updateProfile = async (newProfile: typeof profile) => {
    return mockApiCall({ ...profile, ...newProfile }, 1500)
  }

  const toggleProductLike = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return false
    
    const newLiked = !product.liked
    await mockApiCall(newLiked, 800)
    
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, liked: newLiked, likeCount: p.likeCount + (newLiked ? 1 : -1) }
        : p
    ))
    
    return newLiked
  }

  const updateProductQuantity = async (productId: string, newQuantity: number) => {
    await mockApiCall(newQuantity, 600)
    
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, inCart: newQuantity } : p
    ))
    
    return newQuantity
  }

  const createTodo = async (todo: Partial<TodoItem>) => {
    const newTodo = {
      id: 'todo-${Date.now()}',
      title: todo.title || ',
      description: todo.description || ',
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    await mockApiCall(newTodo, 1000)
    setTodos(prev => [...prev, newTodo])
    return newTodo
  }

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    const updatedTodo = { ...todos.find(t => t.id === id), ...updates }
    await mockApiCall(updatedTodo, 800)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    return updatedTodo as TodoItem
  }

  const deleteTodo = async (id: string) => {
    await mockApiCall(null, 600)
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  // Optimistic hooks
  const profileForm = useOptimisticForm(
    '/api/user/profile',
    updateProfile,
    {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile'
    }
  )

  const notificationToggle = useOptimisticToggle(
    '/api/settings/notifications',
    async (current) => {
      await mockDelay(1000)
      return !current
    },
    true
  )

  const cartItemCounter = useOptimisticCounter(
    '/api/cart/total',
    async (newValue) => {
      await mockDelay(800)
      return newValue
    },
    products.reduce((sum, p) => sum + p.inCart, 0)
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Optimistic UI Patterns</h2>
          <p className="text-neutral-400 mt-2">
            Demonstrate immediate feedback patterns for better user experience
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Live Demo
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
        </TabsList>

        {/* Optimistic Buttons */}
        <TabsContent value="buttons" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  State-aware Buttons
                </CardTitle>
                <CardDescription>
                  Buttons that show different states during async operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <OptimisticButton
                    onClick={async () => {
                      await mockApiCall(null, 2000)
                    }}
                    pendingText="Saving..."
                    successText="Saved!"
                  >
                    Save Changes
                  </OptimisticButton>
                  
                  <OptimisticButton
                    onClick={async () => {
                      await mockApiCall(null, 1500, 0.3) // 30% fail rate
                    }}
                    variant="destructive"
                    pendingText="Deleting..."
                    errorText="Failed to delete"
                  >
                    Delete Item
                  </OptimisticButton>
                  
                  <OptimisticButton
                    onClick={async () => {
                      await mockApiCall(null, 1000)
                    }}
                    variant="outline"
                    pendingText="Uploading..."
                    successText="Uploaded!"
                  >
                    Upload File
                  </OptimisticButton>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5" />
                  Toggle Controls
                </CardTitle>
                <CardDescription>
                  Switches and toggles with optimistic feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-neutral-400">Receive updates via email</p>
                  </div>
                  <Button
                    variant={notificationToggle.state ? "default" : "outline"}
                    size="sm"
                    onClick={notificationToggle.toggle}
                    disabled={notificationToggle.isPending}
                  >
                    {notificationToggle.isPending ? "..." : (notificationToggle.state ? "On" : "Off")}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Cart Items</h4>
                    <p className="text-sm text-neutral-400">Total items in cart</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">{cartItemCounter.value}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cartItemCounter.decrement}
                        disabled={cartItemCounter.isPending || cartItemCounter.value <= 0}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cartItemCounter.increment}
                        disabled={cartItemCounter.isPending}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimistic Forms */}
        <TabsContent value="forms" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="w-5 h-5" />
                Profile Update Form
              </CardTitle>
              <CardDescription>
                Form with optimistic updates and error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                await profileForm.execute({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string
                })
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-200">Name</label>
                    <Input
                      name="name"
                      defaultValue={profile.name}
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-200">Email</label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={profile.email}
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                </div>
                
                <OptimisticButton
                  type="submit"
                  isPending={profileForm.isPending}
                  isError={!!profileForm.error}
                  pendingText="Updating Profile..."
                  errorText="Update Failed"
                  className="mt-4"
                >
                  Update Profile
                </OptimisticButton>
                
                {profileForm.error && (
                  <p className="text-sm text-red-400 mt-2">
                    {profileForm.error.message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimistic Lists */}
        <TabsContent value="lists" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5" />
                Todo List with Optimistic Updates
              </CardTitle>
              <CardDescription>
                Add, edit, delete, and reorder items with immediate feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OptimisticList
                items={todos}
                cacheKey="/api/todos"
                onAdd={createTodo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                allowReorder={true}
                showCompleted={true}
                addPlaceholder="Add a new todo..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Elements */}
        <TabsContent value="interactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5" />
                  Like Buttons
                </CardTitle>
                <CardDescription>
                  Social interaction buttons with optimistic updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <OptimisticLikeButton
                    isLiked={false}
                    likeCount={42}
                    onToggle={async () => {
                      await mockDelay(800)
                    }}
                    variant="heart"
                    showCount={true}
                  />
                  
                  <OptimisticLikeButton
                    isLiked={true}
                    likeCount={128}
                    onToggle={async () => {
                      await mockDelay(600)
                    }}
                    variant="thumbs"
                    size="lg"
                    showCount={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5" />
                  Quantity Selectors
                </CardTitle>
                <CardDescription>
                  Increment/decrement controls with optimistic feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                    <span className="text-white">Small Counter</span>
                    <OptimisticQuantitySelector
                      value={5}
                      onIncrement={async () => mockDelay(500)}
                      onDecrement={async () => mockDelay(500)}
                      size="sm"
                      max={10}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                    <span className="text-white">Medium Counter</span>
                    <OptimisticQuantitySelector
                      value={12}
                      onIncrement={async () => mockDelay(600)}
                      onDecrement={async () => mockDelay(600)}
                      size="md"
                      step={2}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg">
                    <span className="text-white">Large Counter</span>
                    <OptimisticQuantitySelector
                      value={3}
                      onIncrement={async () => mockDelay(400)}
                      onDecrement={async () => mockDelay(400)}
                      size="lg"
                      step={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* E-commerce Demo */}
        <TabsContent value="ecommerce" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5" />
                Product Catalog
              </CardTitle>
              <CardDescription>
                E-commerce interactions with optimistic updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                    <div className="aspect-square bg-neutral-800 rounded-lg mb-4 flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-neutral-600" />
                    </div>
                    
                    <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-green-400 mb-4">${product.price}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <OptimisticLikeButton
                        isLiked={product.liked}
                        likeCount={product.likeCount}
                        onToggle={() => toggleProductLike(product.id)}
                        size="sm"
                      />
                      
                      <span className="text-sm text-neutral-400">
                        {product.stock} in stock
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <OptimisticQuantitySelector
                        value={product.inCart}
                        onIncrement={async () => {
                          await updateProductQuantity(product.id, product.inCart + 1)
                        }}
                        onDecrement={async () => {
                          await updateProductQuantity(product.id, Math.max(0, product.inCart - 1))
                        }}
                        max={product.stock}
                        size="sm"
                      />
                      
                      <Button
                        size="sm"
                        disabled={product.inCart === 0}
                        variant={product.inCart > 0 ? "default" : "outline"}
                      >
                        {product.inCart > 0 ? 'In Cart (${product.inCart})' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Stats */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            Performance Benefits
          </CardTitle>
          <CardDescription>
            Optimistic UI patterns improve perceived performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-950 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">-60%</div>
              <div className="text-sm text-neutral-400">Perceived Wait Time</div>
            </div>
            <div className="text-center p-4 bg-neutral-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">+40%</div>
              <div className="text-sm text-neutral-400">User Engagement</div>
            </div>
            <div className="text-center p-4 bg-neutral-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-2">+25%</div>
              <div className="text-sm text-neutral-400">Task Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OptimisticUIDemo