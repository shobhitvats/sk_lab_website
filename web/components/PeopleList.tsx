"use client";

import { Person } from '@/lib/types';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { TiltCard } from '@/components/ui/TiltCard';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PeopleListProps {
    people: Person[];
}

export const PeopleList = ({ people }: PeopleListProps) => {
    const roles = [
        "Principal Investigator",
        "Postdoctoral Fellows",
        "PhD Students",
        "Masters Students",
        "Undergraduate Students",
        "Alumni"
    ];

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
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-32">
            {roles.map((role) => {
                const group = people.filter(p => p.role === role);
                if (group.length === 0) return null;

                return (
                    <section key={role}>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl font-serif text-white">{role}</h2>
                            <div className="h-px bg-white/20 flex-grow"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {group.map((person, i) => (
                                <motion.div key={i} variants={item}>
                                    <TiltCard className="h-full">
                                        <SpotlightCard className="p-0 bg-card h-full flex flex-col border border-border">
                                            <div className="aspect-[4/3] overflow-hidden bg-muted relative group">
                                                {person.photo ? (
                                                    <Image src={person.photo} alt={person.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80"></div>
                                            </div>
                                            <div className="p-6 relative flex-grow">
                                                <h3 className="text-xl font-bold text-foreground mb-1">{person.name}</h3>
                                                {person.email && (
                                                    <a href={`mailto:${person.email}`} className="text-sm text-accent-400 hover:text-foreground transition block mb-2">{person.email}</a>
                                                )}
                                                <p className="text-muted-foreground text-sm line-clamp-3">{person.bio}</p>
                                            </div>
                                        </SpotlightCard>
                                    </TiltCard>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};
