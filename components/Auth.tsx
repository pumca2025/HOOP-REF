import React, { useState, useEffect, useRef } from 'react';
import { Dribbble, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register } from '../services/apiService';

interface AuthProps {
    onSuccess: (token: string, user: any) => void;
    isLoading: boolean;
}

// Extend window to include Google GSI types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    cancel: () => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Auth: React.FC<AuthProps> = ({ onSuccess, isLoading: externalLoading }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const gsiInitialized = useRef(false);

    // Initialize Google GSI silently in the background — does NOT block the UI
    useEffect(() => {
        const tryInit = () => {
            if (gsiInitialized.current) return;
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredential,
                    ux_mode: 'popup',
                    cancel_on_tap_outside: false,
                });
                gsiInitialized.current = true;
            }
        };

        // Try immediately, then poll every 200ms (stops once ready)
        tryInit();
        const interval = setInterval(() => {
            if (gsiInitialized.current) {
                clearInterval(interval);
                return;
            }
            tryInit();
        }, 200);

        // Cleanup after 10 seconds max (don't poll forever)
        const timeout = setTimeout(() => clearInterval(interval), 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Called by GSI with a credential (ID Token JWT)
    const handleGoogleCredential = (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
            setError('Google Sign-In was cancelled. Please try again.');
            return;
        }
        // Pass the ID token to App.tsx which calls the backend
        onSuccess(credentialResponse.credential, null);
    };

    const handleGoogleLogin = () => {
        setError(null);

        // If GSI not initialized yet, wait a moment then try
        if (!gsiInitialized.current) {
            // Give it up to 3 seconds
            let waited = 0;
            const wait = setInterval(() => {
                waited += 200;
                if (gsiInitialized.current) {
                    clearInterval(wait);
                    triggerGooglePrompt();
                } else if (waited >= 3000) {
                    clearInterval(wait);
                    setError('Google Sign-In unavailable. Please check your connection or use Email/Password.');
                }
            }, 200);
            return;
        }

        triggerGooglePrompt();
    };

    const triggerGooglePrompt = () => {
        try {
            window.google!.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Popup blocked in strict WebViews — show helpful message
                    setError('Google popup was blocked. Please use Email/Password login instead.');
                }
            });
        } catch (err) {
            setError('Google Sign-In failed. Please use Email/Password login.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        setError(null);
        try {
            const response = isRegister
                ? await register(formData)
                : await login({ email: formData.email, password: formData.password });

            onSuccess(response.data.token, response.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLocalLoading(false);
        }
    };

    const isLoading = externalLoading || localLoading;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/basketball.png')]">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[40px] shadow-2xl text-center border border-gray-100"
            >
                <div className="bg-black w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Dribbble className="w-12 h-12 text-orange-600" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">HoopRef</h1>
                <p className="text-gray-500 mb-8 font-medium">Official Basketball Referee Assistant</p>

                <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setIsRegister(false)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isRegister ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsRegister(true)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${isRegister ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <AnimatePresence mode="wait">
                        {isRegister && (
                            <motion.div
                                key="name"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required={isRegister}
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-orange-600 outline-none transition-all font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                placeholder="ref@hoopref.com"
                                required
                                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-orange-600 outline-none transition-all font-bold"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-orange-600 outline-none transition-all font-bold"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRegister ? 'Create Account' : 'Sign In'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs font-black text-gray-300 uppercase">OR</span>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Google button — always visible, never shows "Loading Google..." */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
                    Continue with Google
                </button>

                <p className="mt-8 text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">
                    By continuing, you agree to our <br />
                    <span className="font-bold text-gray-700">Standards of Professional Conduct</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
