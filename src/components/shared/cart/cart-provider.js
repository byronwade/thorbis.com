"use client";

import React from 'react';
import { useCartStore } from '@store/cart';
import CartDrawer from './cart-drawer';

export default function CartProvider({ children }) {
  // Initialize cart store
  React.useEffect(() => {
    useCartStore.getState().initialize();
  }, []);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
