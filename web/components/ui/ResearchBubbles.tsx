"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
    id: number;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
}

const COLORS = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-indigo-500",
];

// Simple deterministic random to keep render pure
function deterministicRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function ResearchBubbles({ topics }: { topics: string[] }) {
    // Determine bubbles using useMemo with deterministic values
    const bubbles = useMemo(() => {
        return topics.map((topic, i) => {
            const seed = topic.length + i * 100;
            return {
                id: i,
                text: topic,
                x: deterministicRandom(seed) * 80 + 10, // Percent
                y: deterministicRandom(seed + 1) * 80 + 10, // Percent
                vx: (deterministicRandom(seed + 2) - 0.5) * 0.15,
                vy: (deterministicRandom(seed + 3) - 0.5) * 0.15,
                radius: 8 + deterministicRandom(seed + 4) * 4, // Visual size logic
                color: COLORS[i % COLORS.length]
            };
        });
    }, [topics]);

    // CSS-based Floating Bubble implementation for stability
    return (
        <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-sm">
            {bubbles.map((bubble, i) => (
                <BubbleNode key={i} bubble={bubble} index={i} />
            ))}
        </div>
    );
}

function BubbleNode({ bubble, index }: { bubble: Bubble, index: number }) {
    // Use useMemo for random values to keep them pure during render
    const { duration, yOffset } = useMemo(() => {
        const seed = index * 123;
        return {
            duration: 10 + deterministicRandom(seed) * 10,
            yOffset: 10 + deterministicRandom(seed + 1) * 20
        };
    }, [index]);

    return (
        <motion.div
            className={`absolute flex items-center justify-center px-4 py-2 rounded-full shadow-lg border border-white/10 backdrop-blur-md cursor-pointer hover:z-50 hover:scale-110 transition-transform ${bubble.color} bg-opacity-20 dark:bg-opacity-30 text-slate-800 dark:text-white font-medium text-sm text-center`}
            style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -yOffset, 0],
                x: [0, (index % 2 === 0 ? 5 : -5), 0]
            }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5, type: "spring" },
                y: { duration: duration, repeat: Infinity, ease: "easeInOut" },
                x: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.15 }}
        >
            {bubble.text}
        </motion.div>
    );
}
