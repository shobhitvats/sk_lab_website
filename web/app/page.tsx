import { getProfile, getLabInfo, getNews } from '@/lib/api';
import Link from 'next/link';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { CountUp } from '@/components/ui/CountUp';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ResearchBubbles } from '@/components/ui/ResearchBubbles';
import { TextReveal } from '@/components/ui/TextReveal';
import { ParallaxImage } from '@/components/ui/ParallaxImage';

export default async function Home() {
  const profile = await getProfile();
  const labInfo = await getLabInfo();
  const news = (await getNews()).filter(n => n.featured).slice(0, 4); // Get 4 items for grid

  return (
    <div className="min-h-screen text-foreground selection:bg-accent-500 selection:text-white">

      {/* Editorial Hero */}
      <AuroraBackground className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden relative">

        <div className="relative z-10 text-center space-y-6">
          <h2 className="text-black dark:text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mix-blend-overlay dark:mix-blend-normal">
            Research & Innovation
          </h2>
          <div className="text-7xl md:text-[6rem] lg:text-[8rem] font-serif leading-[0.9] tracking-tight text-black dark:text-foreground">
            <span className="block italic text-black/60 dark:text-muted-foreground animate-fade-in-up">The</span>
            <TextReveal text={labInfo.lab_name} className="inline-block" delay={0.2} />
          </div>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-black/70 dark:text-muted-foreground font-light leading-relaxed animate-fade-in-up delay-100">
            &quot;{labInfo.mission_statement}&quot;
          </p>

          <div className="pt-8 flex justify-center gap-4 animate-fade-in-up delay-200">
            <MagneticButton>
              <Link href="/lab" className="px-8 py-3 bg-black dark:bg-foreground text-white dark:text-background font-bold rounded-full hover:bg-accent hover:text-white transition shadow-xl z-20 relative">
                Explore Work
              </Link>
            </MagneticButton>
          </div>
        </div>
      </AuroraBackground>

      {/* Bento Grid Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

          {/* 1. Principal Investigator (Large Vertical) */}
          <SpotlightCard className="md:col-span-3 lg:col-span-2 row-span-2 p-0 relative group overflow-hidden">
            <div className="absolute inset-0 z-0 h-full w-full">
              {profile.profile_photo ? (
                <ParallaxImage
                  src={profile.profile_photo}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent z-10"></div>
            </div>
            <div className="relative z-20 p-8 h-full flex flex-col justify-end">
              <span className="text-accent-400 text-xs font-bold uppercase tracking-wider mb-2 block">Principal Investigator</span>
              <h3 className="text-3xl font-serif text-foreground mb-2">{profile.name}</h3>
              <p className="text-muted-foreground line-clamp-3 mb-4">{profile.bio_short}</p>
              <Link href="/profile" className="text-foreground border-b border-foreground pb-1 hover:text-accent-400 hover:border-accent-400 transition">Read Profile &rarr;</Link>
            </div>
          </SpotlightCard>

          {/* 2. Research Stats / Catchy Number (Small Box) */}
          <SpotlightCard className="md:col-span-3 lg:col-span-2 p-8 flex items-center justify-between bg-card text-card-foreground border-border">
            <div>
              <h3 className="text-5xl font-bold text-foreground mb-1"><CountUp value={3} suffix="+" /></h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Core Areas</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-serif italic text-accent-500"><CountUp value={100} suffix="%" /></div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">Passion</p>
            </div>
          </SpotlightCard>

          {/* 3. Research Areas (Horizontal Strip) */}
          <SpotlightCard className="md:col-span-6 lg:col-span-2 p-0 flex flex-col justify-center bg-gradient-to-br from-white/10 to-transparent dark:from-white/10 dark:to-transparent border border-white/20 overflow-hidden relative group backdrop-blur-[2px]">
            <div className="absolute top-4 left-6 z-10 pointer-events-none">
              <h3 className="text-xl font-serif text-foreground italic">Research Focus</h3>
            </div>

            {/* Interactive Bubbles */}
            <div className="w-full h-full min-h-[220px]">
              <ResearchBubbles topics={labInfo.research_focus_areas} />
            </div>

            <Link href="/lab" className="absolute bottom-4 right-6 text-sm text-accent-400 hover:text-foreground transition z-10 font-bold bg-background/50 backdrop-blur px-3 py-1 rounded-full border border-border">View All Areas &rarr;</Link>
          </SpotlightCard>

          {/* 4. Latest News (Medium Box) */}
          {news[0] && (
            <SpotlightCard className="md:col-span-3 lg:col-span-2 row-span-1 p-8 bg-gradient-to-br from-accent-900/10 to-card">
              <span className="text-accent-500 text-xs font-bold uppercase tracking-wider mb-2 block">Latest News · {news[0].publish_date}</span>
              <Link href="/news" className="block group">
                <h3 className="text-2xl font-bold text-foreground group-hover:underline decoration-accent-500 underline-offset-4 leading-tight mb-2">
                  {news[0].title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{news[0].content}</p>
              </Link>
            </SpotlightCard>
          )}

          {/* 5. Contact / CTA (Small Box) - Simplified & Forced Visibility */}
          <div className="md:col-span-3 lg:col-span-2 relative overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group cursor-pointer border border-black/10 dark:border-white/10 bg-orange-50 dark:bg-card">
            <Link href="/contact" className="w-full h-full p-8 flex flex-col justify-center items-center text-center relative z-20 gap-4">
              <h3 className="text-2xl font-bold text-black dark:text-white" style={{ color: 'var(--foreground-join, black)' }}>Join Us</h3>
              <p className="text-sm text-black/80 dark:text-white/80" style={{ color: 'var(--foreground-join-muted, rgba(0,0,0,0.8))' }}>Interested in collaboration?</p>
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-black/5">
                &rarr;
              </div>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
