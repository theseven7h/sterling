import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, X, Plus, Minus, Trash2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { api } from '../lib/api';
import type { Product, CartItem } from '../types';

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function MainPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                // Ensure data is an array since backend wrapper was removed
                setProducts(productsData || []);
                setCart(cartData || []);
            } catch (err) {
                setError('Failed to securely connect to the store.');
                console.error(err);
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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full"
                />
                <p className="mt-4 text-slate-500 font-medium">Curating your experience...</p>
            </div>
        );
    }

    if (error && products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <LayoutGrid size={48} className="text-rose-400 mb-4" />
                <h2 className="text-2xl font-display font-bold text-slate-900">Oops, something went wrong</h2>
                <p className="text-slate-500 mt-2">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">Reload Page</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative w-full">
            {/* Top Glass Navbar */}
            <nav className="sticky top-0 z-40 bg-white/40 backdrop-blur-2xl border-b border-white/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <h1 className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        TechStore
                    </h1>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-slate-600 hidden sm:block bg-white/50 px-4 py-1.5 rounded-full border border-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                            {userId}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 bg-white/60 border border-white/60 text-slate-700 hover:text-blue-600 rounded-[14px] transition-colors shadow-sm"
                        >
                            <ShoppingCart size={22} />
                            <AnimatePresence>
                                {cartItemsCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-2 -right-2 bg-gradient-to-tr from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border-2 border-white/60 box-content"
                                    >
                                        {cartItemsCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2.5 bg-white/60 border border-white/60 text-slate-500 hover:text-rose-500 hover:bg-white/80 rounded-[14px] transition-all shadow-sm group"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">Curated Collection</h2>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">Discover exclusive drops, premium tech, and the latest innovations for your digital life.</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {products.map((product) => (
                        <motion.div
                            variants={itemVariants}
                            key={product.id}
                            className="group relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:bg-white/60 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col"
                        >
                            <div className="aspect-[4/3] w-full bg-white/30 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                <motion.div whileHover={{ scale: 1.08 }} transition={{ duration: 0.4 }} className="w-full h-full pb-2">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-xl shadow-sm mix-blend-darken"
                                        onError={(e) => {
                                            // Fallback for demo images to look cleaner
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop";
                                        }}
                                    />
                                </motion.div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-end bg-gradient-to-b from-transparent to-white/40">
                                <h3 className="text-xl font-bold text-slate-800 font-display leading-tight">{product.name}</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">${product.price.toFixed(2)}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAddToCart(product.id)}
                                        className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors duration-300 shadow-lg shadow-slate-900/20"
                                    >
                                        Add
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            {/* Glass Cart Sidebar */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 transition-all"
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white/70 backdrop-blur-3xl border-l border-white/60 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-6 border-b border-white/40 flex items-center justify-between bg-white/20">
                                <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
                                    <ShoppingCart className="text-blue-600" />
                                    Your Order
                                </h2>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-900 bg-white/50 hover:bg-white rounded-full transition-all shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                                        <div className="w-24 h-24 bg-white/50 border border-white/60 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                                            <ShoppingCart size={40} className="text-slate-300" />
                                        </div>
                                        <p className="text-xl font-display font-bold text-slate-800">Your cart is empty</p>
                                        <p className="text-sm mt-2">Discover our curated collection and add items to your bag.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-5">
                                        <AnimatePresence>
                                            {cart.map((item) => (
                                                <motion.li
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                                    className="flex gap-4 p-4 bg-white/60 border border-white/60 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="w-20 h-20 bg-white/50 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 p-1">
                                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-xl mix-blend-darken" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 leading-tight pr-2">{item.product.name}</h4>
                                                                <p className="text-blue-600 font-black mt-1">${item.product.price.toFixed(2)}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveFromCart(item.id)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center bg-white/50 border border-white/60 rounded-xl p-1 shadow-inner">
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                                    className="p-1 px-1.5 text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
                                                                >
                                                                    <Minus size={14} strokeWidth={3} />
                                                                </button>
                                                                <span className="font-bold text-slate-800 w-8 text-center text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                                    className="p-1 px-1.5 text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
                                                                >
                                                                    <Plus size={14} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </AnimatePresence>
                                    </ul>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 bg-white/40 border-t border-white/50 backdrop-blur-xl">
                                    <div className="flex justify-between items-end mb-6">
                                        <p className="text-slate-600 font-bold">Estimated Total</p>
                                        <p className="text-4xl font-display font-black text-slate-900 tracking-tight">${cartTotal.toFixed(2)}</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-colors shadow-2xl shadow-blue-900/20 text-lg flex justify-center items-center gap-2 border border-slate-700"
                                        onClick={() => alert('Checkout flow initiated')}
                                    >
                                        Place Order
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
