'use client';

import { useState, useMemo } from 'react';
import { Publication } from '@/lib/types';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicationsListProps {
    publications: Publication[];
}

export function PublicationsList({ publications }: PublicationsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [citationModalOpen, setCitationModalOpen] = useState<string | null>(null); // DOI or Title as key

    // Extract unique years
    const years = useMemo(() => {
        const y = new Set(publications.map(p => p.year.toString()));
        return ['All', ...Array.from(y).sort((a, b) => Number(b) - Number(a))];
    }, [publications]);

    // Filter logic
    const filteredPubs = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch = (
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            const matchesYear = selectedYear === 'All' || pub.year.toString() === selectedYear;
            return matchesSearch && matchesYear;
        }).sort((a, b) => b.year - a.year); // Always sort new to old
    }, [publications, searchQuery, selectedYear]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    // Helper to generate a fallback BibTeX if one isn't provided
    const getBibTeX = (pub: Publication) => {
        if (pub.bibtex) return pub.bibtex;
        // Simple fallback generation
        const id = pub.authors.split(' ')[0].replace(/,/g, '') + pub.year + pub.title.split(' ')[0];
        return `@article{${id},
  title={${pub.title}},
  author={${pub.authors}},
  journal={${pub.venue}},
  year={${pub.year}},
  doi={${pub.doi || ''}}
}`;
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-10">
            {/* Controls */}
            {/* ... controls same ... */}

            {/* Results */}
            <motion.div
                className="space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredPubs.map((pub, i) => (
                        <motion.div
                            key={pub.title + i}
                            layout
                            variants={item}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SpotlightCard className="p-8 bg-card hover:bg-accent/5 transition-colors border border-border">
                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                    <div className="space-y-3 flex-grow">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-accent-400 font-bold font-mono text-sm">{pub.year}</span>
                                            <h3 className="text-xl font-bold text-foreground leading-snug">{pub.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm font-serif italic">{pub.authors}</p>
                                        <div className="flex flex-wrap gap-2 items-center text-xs tracking-wider uppercase text-accent-400/80">
                                            <span className="font-bold">{pub.venue}</span>
                                            {pub.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => setCitationModalOpen(pub.title)}
                                            className="px-4 py-2 border border-border rounded-full text-sm text-muted-foreground hover:bg-foreground hover:text-background transition"
                                        >
                                            Cite
                                        </button>

                                        {pub.doi && (
                                            <a href={`https://doi.org/${pub.doi}`} target="_blank" className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:bg-accent-400 hover:text-white transition">
                                                DOI
                                            </a>
                                        )}
                                        {pub.pdf_link && (
                                            <a href={pub.pdf_link} target="_blank" className="px-4 py-2 border border-border rounded-full text-sm text-muted-foreground hover:bg-foreground hover:text-background transition">
                                                PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredPubs.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-xl">No publications found matching your search.</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedYear('All'); }} className="mt-4 text-accent-400 hover:underline">
                            Clear filters
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Citation Modal */}
            <AnimatePresence>
                {citationModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setCitationModalOpen(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-popover border border-border p-6 rounded-2xl max-w-2xl w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-popover-foreground">Cite this paper</h3>
                                <button onClick={() => setCitationModalOpen(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                            </div>

                            {/* Find the pub */}
                            {(() => {
                                const pub = publications.find(p => p.title === citationModalOpen);
                                if (!pub) return null;
                                const bib = getBibTeX(pub);

                                return (
                                    <div className="space-y-4">
                                        <pre className="bg-muted p-4 rounded-lg text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap font-mono border border-border">
                                            {bib}
                                        </pre>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => copyToClipboard(bib)}
                                                className="px-6 py-2 bg-accent-600 text-white rounded-full font-bold hover:bg-accent-500 transition"
                                            >
                                                Copy to Clipboard
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
