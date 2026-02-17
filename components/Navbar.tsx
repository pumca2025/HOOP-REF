import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    User,
    Play,
    History,
    BookOpen,
    Info,
    LogOut,
    RefreshCcw,
    ChevronRight
} from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
    view: AppView;
    setView: (view: AppView) => void;
    user: any;
    onLogout: () => void;
    onSwitchAccount: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ view, setView, user, onLogout, onSwitchAccount }) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { id: AppView.ANALYZE, label: 'Analyze Play', icon: Play },
        { id: AppView.HISTORY, label: 'History', icon: History },
        { id: AppView.RULEBOOK, label: 'Rulebook (Offline)', icon: BookOpen },
        { id: AppView.PROFILE, label: 'Profile', icon: User },
        { id: AppView.ABOUT, label: 'About Developer', icon: Info },
    ];

    return (
        <>
            <header className="bg-black text-white sticky top-0 z-50 shadow-lg px-4 h-16 flex items-center justify-between">
                <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="bg-orange-600 rounded-lg overflow-hidden">
                        <img src="/Hoopref.png" alt="HoopRef Logo" className="w-7 h-7 object-cover" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">HoopRef</h1>
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}&background=ea580c&color=fff&bold=true`} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </header>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 bg-black text-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="bg-orange-600 rounded-xl overflow-hidden">
                                        <img src="/Hoopref.png" alt="HoopRef Logo" className="w-8 h-8 object-cover" />
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-600">
                                        <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}&background=ea580c&color=fff&bold=true`} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="font-bold text-lg truncate">{user?.name}</h2>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setView(item.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${view === item.id ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-semibold">{item.label}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 opacity-50 ${view === item.id ? 'text-orange-600' : ''}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-100 space-y-2">
                                <button
                                    onClick={onSwitchAccount}
                                    className="w-full flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    <span className="font-medium">Switch Google Account</span>
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
