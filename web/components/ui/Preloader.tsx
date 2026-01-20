"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Preloader = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => {
            setIsLoading(false);
            window.scrollTo(0, 0);
        }, 1500); // Shorter load time since no hefty 3D assets

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.4 } }}
                        className="flex flex-col items-center gap-4"
                    >
                        <h1 className="text-4xl text-white font-serif italic tracking-tighter">SK Lab</h1>
                        <motion.div
                            className="w-12 h-0.5 bg-accent-500"
                            initial={{ width: 0 }}
                            animate={{ width: 48, transition: { duration: 1, ease: "circOut" } }}
                        />
                        <span className="text-white/40 text-xs uppercase tracking-[0.3em]">Initializing</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
