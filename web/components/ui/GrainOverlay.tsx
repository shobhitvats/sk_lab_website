'use client';

export function GrainOverlay() {
    return (
        <div className="pointer-events-none fixed inset-0 z-50 select-none opacity-20 dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-overlay">
            <svg className="h-full w-full">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.80"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
