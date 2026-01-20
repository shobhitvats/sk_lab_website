import { getProfile } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default async function Contact() {
    const profile = await getProfile();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-20 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Get In Touch</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        Contact Us
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <SpotlightCard className="p-10 bg-card border-border h-full flex flex-col justify-center">
                        <h3 className="text-3xl font-serif text-foreground mb-8">Lab Information</h3>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0 text-xl border border-border">📍</div>
                                <div>
                                    <span className="block text-accent-500 text-xs font-bold uppercase tracking-widest mb-1">Address</span>
                                    <p className="text-muted-foreground text-lg leading-relaxed">{profile.office_location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0 text-xl border border-border">✉️</div>
                                <div>
                                    <span className="block text-accent-500 text-xs font-bold uppercase tracking-widest mb-1">Email</span>
                                    <a href={`mailto:${profile.email}`} className="text-foreground text-lg hover:text-accent-400 transition">{profile.email}</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0 text-xl border border-border">📞</div>
                                <div>
                                    <span className="block text-accent-500 text-xs font-bold uppercase tracking-widest mb-1">Phone</span>
                                    <p className="text-muted-foreground text-lg">{profile.phone}</p>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* Map / Visual */}
                    <SpotlightCard className="p-2 bg-card border-border h-full min-h-[400px] relative overflow-hidden group">
                        {/* Placeholder for map - using a creative gradient abstract map representation */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')] opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 opacity-90"></div>

                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4 animate-bounce">🗺️</div>
                                <p className="text-foreground font-serif text-xl">Find us on Campus</p>
                                <a href="#" className="mt-4 inline-block px-6 py-2 bg-foreground text-background font-bold rounded-full hover:bg-accent-500 hover:text-white transition">Open Google Maps</a>
                            </div>
                        </div>
                    </SpotlightCard>

                </div>
            </div>
        </div>
    );
}
