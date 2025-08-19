"use client";

import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useCartStore } from '@store/cart';
import { toast } from '@components/ui/use-toast';

export default function AddToCartButton({ product, quantity = 1, className = "" }) {
  const { addItem, isInCart, getItemQuantity } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    
    try {
      // Add item to cart
      addItem(product, quantity);
      
      // Show success state
      setIsAdded(true);
      
      // Show toast notification
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        duration: 3000,
      });

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isInCartAlready = isInCart(product?.id);
  const currentQuantity = getItemQuantity(product?.id);

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isAdding || !product}
      className={`w-full h-12 text-lg font-semibold ${className} ${
        isAdded 
          ? 'bg-success hover:bg-success/90 text-success-foreground' 
          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
      }`}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isInCartAlready ? `Update Cart (${currentQuantity})` : 'Add to Cart'}
        </>
      )}
    </Button>
  );
}
