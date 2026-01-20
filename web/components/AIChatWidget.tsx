"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
}

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm the Lab Assistant. Ask me about our PI, research, or recent news.",
            suggestions: ["Who is the PI?", "Tell me about research areas", "Latest papers", "Contact info"]
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI "Thinking" delay
        setTimeout(() => {
            const response = generateResponse(text);
            setIsTyping(false);
            setMessages(prev => [...prev, response]);
        }, 800);
    };

    // --- LOCAL LOGIC ENGINE ---
    const generateResponse = (query: string): Message => {
        const q = query.toLowerCase();

        // 1. PI / Lab Info
        if (q.includes('pi') || q.includes('who is') || q.includes('professor') || q.includes('lead')) {
            return {
                role: 'assistant',
                content: "The lab is led by Prof. Vats, primarily utilizing computational methods to solve complex biological problems. Check out the Profile page for more!",
                suggestions: ["Go to Profile", "Research Areas"]
            };
        }

        // 2. Research Areas
        if (q.includes('research') || q.includes('work') || q.includes('do') || q.includes('area')) {
            return {
                role: 'assistant',
                content: "Our lab focuses on: \n1. Computational Biology \n2. Machine Learning in Genomics \n3. Structural Bioinformatics.",
                suggestions: ["View Projects", "Latest papers"]
            };
        }

        // 3. Papers
        if (q.includes('paper') || q.includes('publication') || q.includes('cite') || q.includes('article')) {
            return {
                role: 'assistant',
                content: "We have published extensively in top-tier journals. You can browse all of them on the Publications page.",
                suggestions: ["Go to Publications", "Search by Year"]
            };
        }

        // 4. Contact
        if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('join')) {
            return {
                role: 'assistant',
                content: "We are always looking for bright minds! You can reach us via the Contact page.",
                suggestions: ["Go to Contact"]
            };
        }

        // Default / Fallback
        return {
            role: 'assistant',
            content: "I'm not sure about that specific detail yet, but I can help you navigate the site. Try asking about our 'Projects' or 'Team'.",
            suggestions: ["View Projects", "Meet the Team"]
        };
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl border-2 border-white/20 hover:border-white transition-colors"
            >
                {isOpen ? '✕' : '🤖'}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-muted border-b border-border flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-foreground text-sm">Lab Assistant</h3>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Online (Local)
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-background">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-accent-500 text-white rounded-tr-sm'
                                        : 'bg-muted text-foreground rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>

                                    {/* Suggestions */}
                                    {msg.suggestions && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.suggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSend(s)}
                                                    className="px-3 py-1 bg-background border border-border rounded-full text-xs text-muted-foreground hover:bg-accent-500 hover:text-white transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex items-start">
                                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-accent-500/50 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-accent-500/50 rounded-full animate-bounce delay-100" />
                                        <span className="w-1.5 h-1.5 bg-accent-500/50 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-border bg-background">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-grow px-4 py-2 bg-muted rounded-full text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-500 placeholder:text-muted-foreground"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="w-10 h-10 bg-accent-500 text-white rounded-full flex items-center justify-center hover:bg-accent-600 disabled:opacity-50 transition-colors"
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
