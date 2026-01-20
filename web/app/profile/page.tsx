import { getProfile } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import Image from 'next/image';

export default async function Profile() {
    const profile = await getProfile();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Photo & Contact */}
                    <div className="lg:col-span-4 space-y-8 sticky top-24">
                        <SpotlightCard className="p-2 border-border bg-card">
                            {profile.profile_photo ? (
                                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                                    <Image src={profile.profile_photo} alt={profile.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                </div>
                            ) : (
                                <div className="w-full aspect-[3/4] bg-muted rounded-lg flex items-center justify-center text-6xl">👤</div>
                            )}
                        </SpotlightCard>

                        <div className="space-y-6">
                            <div className="border-t border-b border-white/10 py-6">
                                <h3 className="text-foreground font-serif text-2xl mb-2">{profile.name}</h3>
                                <p className="text-accent-500 uppercase tracking-widest text-xs font-bold">{profile.title}</p>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-muted-foreground uppercase tracking-wider text-xs mb-1">Email</span>
                                    <a href={`mailto:${profile.email}`} className="text-foreground hover:text-accent-400 transition">{profile.email}</a>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground uppercase tracking-wider text-xs mb-1">Phone</span>
                                    <span className="text-muted-foreground">{profile.phone}</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground uppercase tracking-wider text-xs mb-1">Office</span>
                                    <span className="text-muted-foreground">{profile.office_location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio & Content */}
                    <div className="lg:col-span-8 space-y-16">
                        <header>
                            <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Principal Investigator</h2>
                            <h1 className="text-5xl md:text-7xl font-serif text-foreground animate-fade-in-up leading-tight">
                                Biography
                            </h1>
                        </header>

                        <div className="prose prose-xl dark:prose-invert prose-p:text-muted-foreground prose-headings:font-serif prose-headings:text-foreground prose-a:text-accent-400 max-w-none animate-fade-in-up delay-100">
                            {/* Render Bio with simple paragraphs for now, or markdown if you had a parser */}
                            <p className="whitespace-pre-line leading-relaxed">{profile.bio_long}</p>
                        </div>

                        {/* CV Download / Extra links could go here */}
                    </div>
                </div>

            </div>
        </div>
    );
}
