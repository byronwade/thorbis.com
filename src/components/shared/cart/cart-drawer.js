"use client";

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore, cartUtils } from '@store/cart';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    totalItems, 
    subtotal, 
    total, 
    tax, 
    shipping,
    isEmpty 
  } = useCartStore();

  // Close cart when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Shopping Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Your cart is empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Link
                  href="/store"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isEmpty && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{cartUtils.formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{cartUtils.formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? 'Free' : cartUtils.formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{cartUtils.formatPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href="/store/cart"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  View Cart
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/store/checkout"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Cart Item Component
function CartItem({ item, onRemove, onUpdateQuantity }) {
  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Image */}
      <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image || '/placeholder-product.svg'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-foreground text-sm line-clamp-2">
            {item.name}
          </h3>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {cartUtils.formatPrice(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[20px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
