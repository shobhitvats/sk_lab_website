import { getNews } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import ReactMarkdown from 'react-markdown';

export default async function News() {
    const news = await getNews();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-20 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Lab Updates</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        News
                    </h1>
                </header>

                <div className="space-y-8">
                    {news.map((item, i) => (
                        <SpotlightCard key={i} className="p-8 md:p-10 bg-card border-border animate-fade-in-up" spotlightColor="rgba(202, 138, 4, 0.15)">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-muted rounded-2xl border border-border font-serif">
                                    <span className="text-2xl font-bold text-foreground">{item.publish_date.split('-')[2] || 'DD'}</span>
                                    <span className="text-xs uppercase tracking-widest text-accent-500">{item.publish_date.split('-')[1] || 'MM'}</span>
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <h3 className="text-2xl font-bold text-foreground leading-tight">{item.title}</h3>
                                    <div className="prose dark:prose-invert prose-slate max-w-none text-muted-foreground">
                                        <ReactMarkdown>{item.content}</ReactMarkdown>
                                    </div>
                                    {item.featured && (
                                        <span className="inline-block px-3 py-1 bg-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-wider rounded-full border border-accent-500/20">
                                            Featured Story
                                        </span>
                                    )}
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
