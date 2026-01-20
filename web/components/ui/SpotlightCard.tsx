"use client";

import React, { useRef, useState } from "react";

import { cn } from "@/lib/utils";

export const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.25)",
    style
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    style?: React.CSSProperties;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={style}
            className={cn(
                "relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group",
                className
            )}
        >
            {/* Inner "Glint" Border */}
            <div className="absolute inset-[1px] rounded-xl border border-black/10 dark:border-white/10 pointer-events-none z-20 mix-blend-overlay" />

            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-30"
                style={{
                    opacity,
                    // Use CSS variable for partial dynamic adaptability, or rely on passed prop to be handled by parent.
                    // Ideally, we invert the default spotlight color if none is provided.
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor === "rgba(255, 255, 255, 0.25)" ? "var(--spotlight-color, rgba(0,0,0,0.1))" : spotlightColor}, transparent 40%)`,
                }}
            />
            <div className="relative z-40 h-full">{children}</div>
        </div>
    );
};
