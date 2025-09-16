
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Shield,
  Truck,
  CreditCard,
  CheckCircle,
  Package,
  Clock,
  Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProductById } from "@/data/products";

export const dynamic = "force-dynamic";

// Mock cart data using real product data
const cartItemIds = [
  { id: "thorbis-pos-pro", quantity: 1 },
  { id: "thorbis-flippad", quantity: 2 }
];

const cartItems = cartItemIds.map(item => {
  const product = getProductById(item.id);
  return product ? { ...product, quantity: item.quantity } : null;
}).filter(Boolean);



function CartItem({ item }) {
  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover rounded-xl"
            />
            {item.badge && (
              					<Badge className="absolute -top-1 -left-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                {item.badge}
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {item.description}
                </p>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  ${item.price.toFixed(2)}
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 line-through ml-2">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
                  Quantity:
                </Label>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    className="w-14 text-center border-0 focus:ring-0 h-7 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              					<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 h-7 w-7 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CartSummary({ items }) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = items.reduce((sum, item) => {
    if (item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const shipping = subtotal > 1000 ? 0 : 29.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-600 dark:text-slate-400">Subtotal ({items.length} items)</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          
          {savings > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400 text-sm">Savings</span>
              					<span className="text-primary dark:text-primary font-semibold text-sm">-${savings.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Shipping</span>
            <span className="font-semibold text-sm">
              {shipping === 0 ? 'FREE` : '$${shipping.toFixed(2)}'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Tax</span>
            <span className="font-semibold text-sm">${tax.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span className="text-slate-900 dark:text-white">Total</span>
            <span className="text-slate-900 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>
        
        					<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-2xl">
          <CreditCard className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">
        Your cart is empty
      </h3>
      <p className="text-base text-slate-600 dark:text-slate-400 mb-6">
        Looks like you haven't added any products to your cart yet.
      </p>
      					<Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-semibold rounded-2xl">
        <Link href="/store">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </Button>
    </div>
  );
}

function TrustIndicators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="text-center p-4">
        <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
        <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">30-Day Money Back</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">Risk-free returns</p>
      </div>
      <div className="text-center p-4">
        <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
        <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">Secure Checkout</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">SSL encrypted</p>
      </div>
      <div className="text-center p-4">
        <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
        <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">Fast Shipping</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">2-3 business days</p>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Store
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Review your items and proceed to checkout
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyCart />
            )}
          </div>

          <div className="space-y-6">
            <CartSummary items={cartItems} />
            
            <TrustIndicators />
          </div>
        </div>
      </div>
    </div>
  );
}
