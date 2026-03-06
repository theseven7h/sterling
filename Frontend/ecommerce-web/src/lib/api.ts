import type { Product, CartItem } from '../types';

const getBaseUrl = () => 'http://localhost:5023/api';

export const api = {
    getProducts: async (): Promise<Product[]> => {
        const res = await fetch(`${getBaseUrl()}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    getCart: async (userId: string): Promise<CartItem[]> => {
        const res = await fetch(`${getBaseUrl()}/cart/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
    },

    addToCart: async (userId: string, productId: number, quantity: number = 1): Promise<CartItem> => {
        const res = await fetch(`${getBaseUrl()}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId, quantity })
        });
        if (!res.ok) throw new Error('Failed to add to cart');
        return res.json();
    },

    updateCartItem: async (cartItemId: number, quantity: number): Promise<CartItem | null> => {
        const res = await fetch(`${getBaseUrl()}/cart/${cartItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        if (!res.ok) throw new Error('Failed to update cart item');
        // If quantity is 0, backend returns 204 or null. Handle it gracefully.
        try {
            return await res.json();
        } catch {
            return null;
        }
    },

    removeFromCart: async (cartItemId: number): Promise<boolean> => {
        const res = await fetch(`${getBaseUrl()}/cart/${cartItemId}`, {
            method: 'DELETE'
        });
        return res.ok;
    }
};
