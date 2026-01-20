"use client";

import { useEffect, useState } from "react";

export function GridBackground() {
    // const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
            {/* 1. Base Gradient Glow (Ambient) - Boosted Opacity */}
            <div
                className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-30 dark:opacity-20 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)"
                }}
            />
            <div
                className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-20 dark:opacity-10 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)"
                }}
            />

            {/* 2. Grid Pattern (SVG) - Boosted Contrast & Relaxed Mask */}
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-black/20 dark:text-white/20"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            {/* 3. Subtle Noise Texture Overlay */}
        </div>
    );
}
