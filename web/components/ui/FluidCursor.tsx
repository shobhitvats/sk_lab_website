"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

class Point {
    x: number;
    y: number;
    lifetime: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lifetime = 0;
    }
}

export function FluidCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const points = useRef<Point[]>([]);
    const mouse = useRef({ x: 0, y: 0 });
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeObserver = new ResizeObserver(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        resizeObserver.observe(document.body);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
            // Add multiple points for smoother feel
            points.current.push(new Point(e.clientX, e.clientY));
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update points
            for (let i = 0; i < points.current.length; i++) {
                const point = points.current[i];
                point.lifetime += 1;
            }

            // Remove old points
            points.current = points.current.filter((p) => p.lifetime < 50);

            // Draw trail
            if (points.current.length > 1) {
                ctx.beginPath();
                // Move to first point
                ctx.moveTo(points.current[0].x, points.current[0].y);

                for (let i = 1; i < points.current.length - 1; i++) {
                    const pt = points.current[i];
                    const nextPt = points.current[i + 1];
                    const xc = (pt.x + nextPt.x) / 2;
                    const yc = (pt.y + nextPt.y) / 2;
                    ctx.quadraticCurveTo(pt.x, pt.y, xc, yc);
                }

                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                // Width tapers off
                ctx.lineWidth = 6;

                // Gradient color based on theme
                const gradient = ctx.createLinearGradient(
                    mouse.current.x - 50, mouse.current.y - 50,
                    mouse.current.x + 50, mouse.current.y + 50
                );

                if (theme === 'dark') {
                    gradient.addColorStop(0, "rgba(250, 204, 21, 0.15)"); // Yellow-ish (Subtle)
                    gradient.addColorStop(1, "rgba(250, 204, 21, 0)");
                } else {
                    gradient.addColorStop(0, "rgba(15, 23, 42, 0.1)"); // Slate (Subtle)
                    gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
                }

                ctx.strokeStyle = gradient;
                ctx.shadowBlur = theme === 'dark' ? 5 : 0;
                ctx.shadowColor = theme === 'dark' ? "rgba(250, 204, 21, 0.2)" : "transparent";
                ctx.stroke();
            }

            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[60]" // z-60 to be on top of mostly everything but regular modals
            style={{ mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
        />
    );
}
