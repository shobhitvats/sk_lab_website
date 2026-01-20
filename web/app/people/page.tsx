import { getPeople } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { PeopleList } from '@/components/PeopleList';
import Image from 'next/image';

export default async function People() {
    const people = await getPeople();
    const roles = [
        "Principal Investigator",
        "Postdoctoral Fellows",
        "PhD Students",
        "Masters Students",
        "Undergraduate Students",
        "Alumni"
    ];

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-20 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Our Team</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        <span className="italic text-muted-foreground block text-4xl md:text-5xl mb-2">Meet the</span>
                        Innovators
                    </h1>
                </header>

                <PeopleList people={people} />
            </div>
        </div>
    );
}
