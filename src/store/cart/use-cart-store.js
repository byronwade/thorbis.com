import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// Cart item type definition
export const CartItemType = {
  PRODUCT: 'product',
  SERVICE: 'service',
  SUBSCRIPTION: 'subscription',
};

// Cart store with real-time updates and persistence
export const useCartStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        items: [],
        isOpen: false,
        isLoading: false,
        lastUpdated: null,
        sessionId: null,

        // Computed values
        get totalItems() {
          return get().items.reduce((total, item) => total + item.quantity, 0);
        },

        get subtotal() {
          return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        get total() {
          const subtotal = get().subtotal;
          const tax = subtotal * 0.08; // 8% tax rate
          const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
          return subtotal + tax + shipping;
        },

        get tax() {
          return get().subtotal * 0.08;
        },

        get shipping() {
          const subtotal = get().subtotal;
          return subtotal > 100 ? 0 : 10;
        },

        get isEmpty() {
          return get().items.length === 0;
        },

        // Actions
        initialize: () => {
          const sessionId = Math.random().toString(36).substring(2, 15);
          set({ 
            sessionId,
            lastUpdated: Date.now(),
            isOpen: false 
          });
        },

        // Add item to cart
        addItem: (product, quantity = 1) => {
          set((state) => {
            const existingItem = state.items.find(item => item.id === product.id);
            
            if (existingItem) {
              // Update existing item quantity
              const updatedItems = state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
              
              return {
                items: updatedItems,
                lastUpdated: Date.now(),
              };
            } else {
              // Add new item
              const newItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                type: CartItemType.PRODUCT,
                quantity,
                addedAt: Date.now(),
                sku: product.sku || product.id,
                description: product.description,
                weight: product.weight || 0,
                dimensions: product.dimensions || null,
              };
              
              return {
                items: [...state.items, newItem],
                lastUpdated: Date.now(),
              };
            }
          });
        },

        // Remove item from cart
        removeItem: (itemId) => {
          set((state) => ({
            items: state.items.filter(item => item.id !== itemId),
            lastUpdated: Date.now(),
          }));
        },

        // Update item quantity
        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          set((state) => ({
            items: state.items.map(item =>
              item.id === itemId
                ? { ...item, quantity, updatedAt: Date.now() }
                : item
            ),
            lastUpdated: Date.now(),
          }));
        },

        // Clear cart
        clearCart: () => {
          set({
            items: [],
            lastUpdated: Date.now(),
          });
        },

        // Toggle cart visibility
        toggleCart: () => {
          set((state) => ({
            isOpen: !state.isOpen,
          }));
        },

        // Open cart
        openCart: () => {
          set({ isOpen: true });
        },

        // Close cart
        closeCart: () => {
          set({ isOpen: false });
        },

        // Set loading state
        setLoading: (isLoading) => {
          set({ isLoading });
        },

        // Move item to wishlist (remove from cart)
        moveToWishlist: (itemId) => {
          const item = get().items.find(item => item.id === itemId);
          if (item) {
            // TODO: Add to wishlist store
            get().removeItem(itemId);
          }
        },

        // Apply discount code
        applyDiscount: (code) => {
          // TODO: Implement discount logic
          console.log('Applying discount code:', code);
        },

        // Get item by ID
        getItem: (itemId) => {
          return get().items.find(item => item.id === itemId);
        },

        // Check if item is in cart
        isInCart: (itemId) => {
          return get().items.some(item => item.id === itemId);
        },

        // Get item quantity
        getItemQuantity: (itemId) => {
          const item = get().items.find(item => item.id === itemId);
          return item ? item.quantity : 0;
        },

        // Bulk operations
        addMultipleItems: (products) => {
          products.forEach(product => {
            get().addItem(product, product.quantity || 1);
          });
        },

        // Cart analytics
        getCartAnalytics: () => {
          const state = get();
          return {
            totalItems: state.totalItems,
            subtotal: state.subtotal,
            total: state.total,
            tax: state.tax,
            shipping: state.shipping,
            itemCount: state.items.length,
            categories: [...new Set(state.items.map(item => item.category))],
            lastUpdated: state.lastUpdated,
            sessionId: state.sessionId,
          };
        },

        // Export cart data
        exportCart: () => {
          const state = get();
          return {
            items: state.items,
            analytics: state.getCartAnalytics(),
            timestamp: Date.now(),
          };
        },

        // Import cart data
        importCart: (cartData) => {
          if (cartData && cartData.items) {
            set({
              items: cartData.items,
              lastUpdated: Date.now(),
            });
          }
        },

        // Cleanup
        cleanup: () => {
          set({
            items: [],
            isOpen: false,
            isLoading: false,
            lastUpdated: null,
            sessionId: null,
          });
        },
      }),
      {
        name: 'thorbis-cart-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state.items,
          sessionId: state.sessionId,
          lastUpdated: state.lastUpdated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.initialize();
          }
        },
      }
    )
  )
);

// Real-time subscriptions for cross-tab synchronization
if (typeof window !== 'undefined') {
  // Listen for storage changes (other tabs)
  window.addEventListener('storage', (e) => {
    if (e.key === 'thorbis-cart-storage') {
      useCartStore.getState().initialize();
    }
  });

  // Initialize cart on mount
  useCartStore.getState().initialize();
}

// Export cart utilities
export const cartUtils = {
  // Format price
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  },

  // Calculate shipping cost
  calculateShipping: (items, subtotal) => {
    if (subtotal > 100) return 0; // Free shipping over $100
    return 10; // Standard shipping
  },

  // Validate cart item
  validateItem: (item) => {
    const required = ['id', 'name', 'price', 'quantity'];
    return required.every(field => item[field] !== undefined && item[field] !== null);
  },

  // Get cart summary
  getCartSummary: () => {
    const state = useCartStore.getState();
    return {
      itemCount: state.totalItems,
      subtotal: state.subtotal,
      total: state.total,
      isEmpty: state.isEmpty,
    };
  },
};

export default useCartStore;
