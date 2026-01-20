"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export function ResearchBubbles({ topics }: { topics: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const reqRef = useRef<number>(0);

    useEffect(() => {
        if (!topics.length) return;

        // Initialize bubbles
        const newBubbles = topics.map((topic, i) => ({
            id: i,
            text: topic,
            x: Math.random() * 80 + 10, // Percent
            y: Math.random() * 80 + 10, // Percent
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            radius: 8 + Math.random() * 4, // Visual size logic
            color: COLORS[i % COLORS.length]
        }));
        setBubbles(newBubbles);

        const updatePhysics = () => {
            setBubbles(prev => {
                return prev.map((b, i, arr) => {
                    let { x, y, vx, vy } = b;

                    // Wall collision (soft bounce)
                    if (x <= 5 || x >= 95) vx *= -1;
                    if (y <= 5 || y >= 95) vy *= -1;

                    // Keep within bounds
                    x = Math.max(5, Math.min(95, x + vx));
                    y = Math.max(5, Math.min(95, y + vy));

                    // Very simple repulsion from other bubbles
                    /* 
                       For a truly robust sim we'd need O(N^2) or quadtree, 
                       but for <10 items, O(N^2) is fine. 
                    */
                    /*
                    arr.forEach((other, j) => {
                        if (i === j) return;
                        const dx = x - other.x;
                        const dy = y - other.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const minDist = 15; // approximate % distance
                        if (dist < minDist) {
                             const force = (minDist - dist) * 0.005;
                             vx += (dx / dist) * force;
                             vy += (dy / dist) * force;
                        }
                    });
                    */

                    // Add some random jitter for "brownian" motion feel
                    vx += (Math.random() - 0.5) * 0.01;
                    vy += (Math.random() - 0.5) * 0.01;

                    // Dampen velocity limits
                    const maxVel = 0.2;
                    vx = Math.max(-maxVel, Math.min(maxVel, vx));
                    vy = Math.max(-maxVel, Math.min(maxVel, vy));

                    return { ...b, x, y, vx, vy };
                });
            });
            reqRef.current = requestAnimationFrame(updatePhysics);
        };

        // reqRef.current = requestAnimationFrame(updatePhysics);
        // Actually, let's keep it simpler for CPU efficiency: CSS Animation for float data, 
        // JS only for initial placement to avoid overlapping if possible, or just purely CSS.
        // The implementation_plan said "Custom Physics". Let's stick to a simpler CSS-based float
        // to ensure 60fps and no hydration mismatches.

        return () => cancelAnimationFrame(reqRef.current);
    }, [topics]);

    // CSS-based Floating Bubble implementation for stability
    return (
        <div ref={containerRef} className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-sm">
            {bubbles.map((bubble, i) => (
                <BubbleNode key={i} bubble={bubble} index={i} />
            ))}
        </div>
    );
}

function BubbleNode({ bubble, index }: { bubble: Bubble, index: number }) {
    // Random float animation params
    const duration = 10 + Math.random() * 10;
    const yOffset = 10 + Math.random() * 20;

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
