import { Product, CartItem } from '../types';

const API_BASE = 'http://localhost:5038/api'; // Or 5000/5001 depending on launch settings. Let's assume standard app.Run() minimal API port or we'll configure it.
// Default .NET 8 HTTP port is usually 5000, let's use a dynamic one or default
const getBaseUrl = () => 'http://localhost:5000/api';

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
