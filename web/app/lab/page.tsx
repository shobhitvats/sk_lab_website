import { getLabInfo } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default async function Lab() {
    const labInfo = await getLabInfo();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-20 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Facilities & Equipment</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        Lab Info
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Mission Statement */}
                    <SpotlightCard className="md:col-span-3 p-10 bg-card border-border">
                        <h2 className="text-3xl font-serif text-foreground mb-6">Mission</h2>
                        <p className="text-2xl font-light leading-relaxed text-muted-foreground">&quot;{labInfo.mission_statement}&quot;</p>
                    </SpotlightCard>
                </div>

                {/* Research Areas Detail */}
                <section className="space-y-12">
                    <h2 className="text-4xl font-serif text-foreground border-b border-border pb-6">Research Areas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {labInfo.research_focus_areas.map((area, i) => (
                            <SpotlightCard key={i} className="p-8 bg-card border-border flex items-center gap-6">
                                <div className="text-6xl font-serif text-muted/20 italic">0{i + 1}</div>
                                <h3 className="text-2xl font-bold text-foreground">{area}</h3>
                            </SpotlightCard>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
