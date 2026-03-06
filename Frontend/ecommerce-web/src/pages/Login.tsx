import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            sessionStorage.setItem('userId', username);
            navigate('/main');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md w-full p-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                        className="p-4 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-2xl mb-6 shadow-xl shadow-blue-500/20"
                    >
                        <Sparkles size={32} />
                    </motion.div>
                    <h2 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">TechStore</h2>
                    <p className="text-slate-500 mt-2 font-medium">Enter your details to proceed</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            id="username"
                            type="text"
                            required
                            className="w-full px-5 py-4 bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium placeholder:text-slate-400 text-slate-800 shadow-inner"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-4 rounded-2xl transition-colors flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20"
                    >
                        Sign In <LogIn size={20} />
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
