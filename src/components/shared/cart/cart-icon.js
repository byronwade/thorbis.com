"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@store/cart';
import Link from 'next/link';

export default function CartIcon({ className = "", showCount = true, linkToCart = true }) {
  const { totalItems, openCart } = useCartStore();

  const CartButton = () => (
    <button
      onClick={openCart}
      className={`relative group ${className}`}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      
      {showCount && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );

  if (linkToCart) {
    return (
      <Link href="/store/cart" className={`relative group ${className}`}>
        <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        
        {showCount && totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Link>
    );
  }

  return <CartButton />;
}
