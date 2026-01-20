"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Profile', href: '/profile' },
        { name: 'Lab', href: '/lab' },
        { name: 'People', href: '/people' },
        { name: 'Publications', href: '/publications' },
        { name: 'Projects', href: '/projects' },
        { name: 'News', href: '/news' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-md border-border h-16 shadow-sm' : 'bg-background/20 backdrop-blur-sm border-white/5 h-24'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center">
                        <Link href="/" className={`text-2xl font-serif font-bold tracking-tight transition-colors duration-300 text-foreground`}>
                            SK Lab<span className="text-accent-500">.</span>
                        </Link>
                    </div>
                    <div className="hidden lg:ml-8 lg:flex lg:space-x-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            // Change text color based on scroll/page
                            const isHome = pathname === '/';
                            // Logic: 
                            // - Transparent Home: White text (overlay).
                            // - Scrolled/Other: Standard text (Foreground). 
                            // Note: We use data-theme aware classes or just standard semantic classes.

                            // If we are on home and not scrolled, we are over the dark hero background.
                            // If we switch to light mode, the hero background changes? 
                            // Wait, if the Home page HERO is always dark (styled that way), then text-white is correct there?
                            // But user wants light/dark mode. So Home Hero should also change?
                            // If Home Hero changes to light, text-white is invisible.

                            // Let's assume Home Hero follows the theme (bg-background).
                            // So we should just use text-foreground everywhere except maybe strictly transparent states if required.

                            // Actually, standardizing on semantic colors is safest.
                            const textColor = (!scrolled && isHome)
                                ? 'text-foreground/90 hover:text-foreground'
                                : 'text-muted-foreground hover:text-foreground';

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative text-sm font-medium transition-all duration-300 ${textColor} ${isActive ? 'font-bold text-foreground' : ''}`}
                                >
                                    {item.name}
                                    {isActive && (
                                        <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500`} />
                                    )}
                                </Link>
                            );
                        })}
                        <div className="pl-4 border-l border-white/20 ml-4">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
