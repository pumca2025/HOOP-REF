import React from 'react';
import { motion } from 'framer-motion';
import { Dribbble } from 'lucide-react';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="bg-orange-600 p-6 rounded-3xl shadow-2xl mb-6">
                    <Dribbble className="w-20 h-20 text-white animate-pulse" />
                </div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-4xl font-bold text-white tracking-widest uppercase"
                >
                    HoopRef
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-orange-500 font-medium mt-2"
                >
                    Analyzing the Game
                </motion.p>
            </motion.div>

            <motion.div
                className="absolute bottom-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-orange-600"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default SplashScreen;
