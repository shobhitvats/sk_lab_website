"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ParallaxImageProps extends ImageProps {
    offset?: number;
}

export function ParallaxImage({ className, offset = 50, alt, ...props }: ParallaxImageProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

    return (
        <div ref={ref} className={cn("overflow-hidden h-full w-full relative", className)}>
            <motion.div style={{ y }} className="w-full h-[120%] relative -top-[10%]">
                <Image
                    alt={alt}
                    {...props}
                    className="object-cover"
                />
            </motion.div>
        </div>
    );
}
