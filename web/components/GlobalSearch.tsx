"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
    id: string;
    title: string;
    type: "page" | "person" | "project" | "news";
    url: string;
}

interface GlobalSearchProps {
    items: SearchItem[];
}

export function GlobalSearch({ items }: GlobalSearchProps) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Command Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <Command className="w-full bg-transparent">
                            <div className="flex items-center border-b border-border px-4">
                                <span className="text-muted-foreground mr-3">🔍</span>
                                <Command.Input
                                    placeholder="Search for people, projects, pages..."
                                    className="w-full bg-transparent py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                            </div>

                            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                                <Command.Empty className="py-6 text-center text-muted-foreground">No results found.</Command.Empty>

                                <Command.Group heading="Pages" className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                                    {items.filter(i => i.type === 'page').map(item => (
                                        <Command.Item
                                            key={item.id}
                                            onSelect={() => runCommand(() => router.push(item.url))}
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer transition-colors"
                                        >
                                            <span className="text-lg">📄</span>
                                            <span className="text-base font-medium">{item.title}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading="People" className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                                    {items.filter(i => i.type === 'person').map(item => (
                                        <Command.Item
                                            key={item.id}
                                            onSelect={() => runCommand(() => router.push(item.url))}
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer transition-colors"
                                        >
                                            <span className="text-lg">👤</span>
                                            <span className="text-base font-medium">{item.title}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading="Projects" className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                                    {items.filter(i => i.type === 'project').map(item => (
                                        <Command.Item
                                            key={item.id}
                                            onSelect={() => runCommand(() => router.push(item.url))}
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer transition-colors"
                                        >
                                            <span className="text-lg">🧪</span>
                                            <span className="text-base font-medium">{item.title}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading="News" className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                                    {items.filter(i => i.type === 'news').map(item => (
                                        <Command.Item
                                            key={item.id}
                                            onSelect={() => runCommand(() => router.push(item.url))}
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer transition-colors"
                                        >
                                            <span className="text-lg">📰</span>
                                            <span className="text-base font-medium">{item.title}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                            </Command.List>

                            <div className="border-t border-border px-4 py-2 flex justify-between items-center text-xs text-muted-foreground">
                                <div>
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground mr-2">↑↓</span>
                                    to navigate
                                </div>
                                <div>
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground mr-2">↵</span>
                                    to select
                                </div>
                            </div>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
