"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // Assuming lucide-react or similar icons are available, or I'll use the emojis/svgs from before

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = (e: React.MouseEvent) => {
        const newTheme = theme === 'light' ? 'dark' : 'light';

        // Check for View Transition API support
        if (!(document as any).startViewTransition) {
            setTheme(newTheme);
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y)
        );

        const transition = (document as any).startViewTransition(() => {
            setTheme(newTheme);
        });

        transition.ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            // Animate the new view (which is the whole screen in the new theme)
            // growing from the click point
            document.documentElement.animate(
                {
                    clipPath: theme === 'dark' ? [...clipPath].reverse() : clipPath,
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: theme === 'dark'
                        ? "::view-transition-old(root)"
                        : "::view-transition-new(root)",
                }
            );
        });
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors relative overflow-hidden w-10 h-10 flex items-center justify-center text-foreground group"
            aria-label="Toggle Theme"
        >
            <div className="relative z-10">
                {theme === 'dark' ? '☀️' : '🌙'}
            </div>
            {/* Optional: Add a subtle glow/ring on hover */}
            <span className="absolute inset-0 bg-accent/20 scale-0 group-hover:scale-100 transition-transform rounded-full" />
        </button>
    );
}
