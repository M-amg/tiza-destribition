import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addCartItem, checkoutCart, fetchMyCart, removeCartItem, updateCartItem } from './cartApi';
import { Cart, CheckoutPayload, CheckoutResult } from './types';

type CartContextValue = {
  cart: Cart | null;
  isReady: boolean;
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setProductQuantity: (productId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  placeOrder: (payload: CheckoutPayload) => Promise<CheckoutResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { authorizedRequest, isAuthenticated, isReady: authReady, session } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = session?.accessToken ?? null;

  const refreshCart = async () => {
    if (!accessToken) {
      setCart(null);
      return;
    }

    setIsLoading(true);

    try {
      const nextCart = await authorizedRequest((token) => fetchMyCart(token));
      setCart(nextCart);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!authReady) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        if (!cancelled) {
          setCart(null);
          setIsReady(true);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const nextCart = await authorizedRequest((token) => fetchMyCart(token));
        if (!cancelled) {
          setCart(nextCart);
        }
      } catch {
        // Keep the current session and cart state if bootstrap refresh fails.
      } finally {
        if (!cancelled) {
          setIsReady(true);
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [accessToken, authReady, isAuthenticated]);

  const addItem = async (productId: string, quantity: number) => {
    if (!session?.accessToken) {
      throw new Error('You must be signed in to add items to cart.');
    }

    setIsLoading(true);

    try {
      const nextCart = await authorizedRequest((token) => addCartItem(token, productId, quantity));
      setCart(nextCart);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!session?.accessToken) {
      throw new Error('You must be signed in to update your cart.');
    }

    setIsLoading(true);

    try {
      const nextCart = await authorizedRequest((token) => updateCartItem(token, itemId, quantity));
      setCart(nextCart);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!session?.accessToken) {
      throw new Error('You must be signed in to update your cart.');
    }

    setIsLoading(true);

    try {
      const nextCart = await authorizedRequest((token) => removeCartItem(token, itemId));
      setCart(nextCart);
    } finally {
      setIsLoading(false);
    }
  };

  const setProductQuantity = async (productId: string, quantity: number) => {
    const currentItem = cart?.items.find((item) => item.productId === productId);

    if (quantity <= 0) {
      if (currentItem) {
        await removeItem(currentItem.id);
      }
      return;
    }

    if (currentItem) {
      await updateItemQuantity(currentItem.id, quantity);
      return;
    }

    await addItem(productId, quantity);
  };

  const placeOrder = async (payload: CheckoutPayload) => {
    if (!session?.accessToken) {
      throw new Error('You must be signed in to place an order.');
    }

    setIsLoading(true);

    try {
      const result = await authorizedRequest((token) => checkoutCart(token, payload));
      const nextCart = await authorizedRequest((token) => fetchMyCart(token));
      setCart(nextCart);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isReady,
        isLoading,
        addItem,
        updateItemQuantity,
        removeItem,
        setProductQuantity,
        refreshCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
