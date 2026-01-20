"use client";

import { motion, Variants } from 'framer-motion';

export const TextReveal = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const characters = text.split("");

    // Simplified variants without explicit typing to avoid TS conflicts
    const container: Variants = {
        hidden: { opacity: 0 },
        visible: () => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay * 0.1 },
        }),
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            }
        },
    };

    return (
        <motion.h1
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={className}
        >
            {characters.map((char, index) => (
                <motion.span variants={child} key={index} className="inline-block">
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </motion.h1>
    );
};
