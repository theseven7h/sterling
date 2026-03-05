import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, X, Plus, Minus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Product, CartItem } from '../types';

export default function MainPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            try {
                const [productsData, cartData] = await Promise.all([
                    api.getProducts(),
                    api.getCart(userId)
                ]);
                setProducts(productsData);
                setCart(cartData);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId, navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    const handleAddToCart = async (productId: number) => {
        if (!userId) return;
        try {
            const newItem = await api.addToCart(userId, productId, 1);
            setCart((prev) => {
                const exists = prev.find((i) => i.id === newItem.id);
                if (exists) {
                    return prev.map((i) => (i.id === newItem.id ? newItem : i));
                }
                return [...prev, newItem];
            });
            setIsCartOpen(true);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleUpdateQuantity = async (cartItemId: number, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change;
        try {
            if (newQuantity <= 0) {
                await handleRemoveFromCart(cartItemId);
                return;
            }

            const updatedItem = await api.updateCartItem(cartItemId, newQuantity);
            if (updatedItem) {
                setCart((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveFromCart = async (cartItemId: number) => {
        try {
            const success = await api.removeFromCart(cartItemId);
            if (success) {
                setCart((prev) => prev.filter((item) => item.id !== cartItemId));
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold tracking-tight text-blue-600">TechStore</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                                Welcome, {userId}
                            </span>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                aria-label="Open cart"
                            >
                                <ShoppingCart size={24} />
                                {cartItemsCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="hidden sm:inline-block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
                    <p className="mt-2 text-gray-500">Discover our latest tech deals</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-4 h-10">{product.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsCartOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <ShoppingCart className="text-blue-600" />
                                Your Cart
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <ShoppingCart size={48} className="text-gray-300 mb-4" />
                                    <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                                    <p className="text-sm">Looks like you haven't added any items yet.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-6 text-blue-600 font-medium hover:text-blue-700"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    {cart.map((item) => (
                                        <li key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                                                        <p className="text-blue-600 font-medium">${item.product.price.toFixed(2)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                        className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-medium text-gray-900 w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                        className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="flex justify-between text-base font-bold text-gray-900 mb-6">
                                    <p>Subtotal</p>
                                    <p>${cartTotal.toFixed(2)}</p>
                                </div>
                                <button
                                    type="button"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-sm"
                                    onClick={() => alert('Checkout is out of scope for this task!')}
                                >
                                    Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
