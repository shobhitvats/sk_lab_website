import { getPublications } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { PublicationsList } from '@/components/PublicationsList';

export default async function Publications() {
    const allPubs = await getPublications();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-12 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Scientific Output</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        Publications
                    </h1>
                </header>

                <div className="animate-fade-in-up delay-100">
                    <PublicationsList publications={allPubs} />
                </div>
            </div>
        </div>
    );
}
