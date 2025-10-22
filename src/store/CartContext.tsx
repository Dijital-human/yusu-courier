/**
 * Cart Context / Səbət Konteksti
 * This context provides cart management functionality
 * Bu kontekst səbət idarəetmə funksionallığını təmin edir
 */

"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the shape of the cart state
interface CartState {
  items: any[];
  totalItems: number;
  totalPrice: number;
  error: string | null;
}

// Define the actions that can be dispatched
type CartAction =
  | { type: 'ADD_ITEM'; payload: any }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state for the cart
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  error: null,
};

// Reducer function to manage cart state
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + newItem.quantity,
          totalPrice: state.totalPrice + (newItem.price * newItem.quantity),
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + newItem.quantity,
          totalPrice: state.totalPrice + (newItem.price * newItem.quantity),
        };
      }
    }
    case 'REMOVE_ITEM': {
      const idToRemove = action.payload;
      const itemToRemove = state.items.find(item => item.id === idToRemove);

      if (!itemToRemove) return state;

      const updatedItems = state.items.filter(item => item.id !== idToRemove);
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity),
      };
    }
    case 'UPDATE_ITEM_QUANTITY': {
      const { id, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === id);

      if (existingItemIndex === -1) return state;

      const existingItem = state.items[existingItemIndex];
      const quantityDifference = quantity - existingItem.quantity;

      const updatedItems = state.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: quantity }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDifference,
        totalPrice: state.totalPrice + (existingItem.price * quantityDifference),
      };
    }
    case 'CLEAR_CART':
      return {
        ...initialState,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Define the shape of the context value
interface CartContextType {
  state: CartState;
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component / Səbət Provayder Komponenti
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Add item to cart / Səbətə məhsul əlavə et
  const addItem = (item: any) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
  };

  // Remove item from cart / Səbətdən məhsulu çıxar
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update item quantity in cart / Səbətdə məhsulun miqdarını yenilə
  const updateItemQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id, quantity } });
  };

  // Clear cart / Səbəti təmizlə
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Set error message / Xəta mesajı təyin et
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const contextValue = {
    state,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    setError,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context / Səbət kontekstini istifadə etmək üçün xüsusi hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
