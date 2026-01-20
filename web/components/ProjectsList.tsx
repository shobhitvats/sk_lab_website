"use client";

import { Project } from '@/lib/types';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { TiltCard } from '@/components/ui/TiltCard';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProjectsListProps {
    projects: Project[];
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
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
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {projects.map((project, i) => (
                <motion.div key={i} variants={item}>
                    <TiltCard className="h-full">
                        <SpotlightCard className="flex flex-col h-full bg-card border border-border">
                            <div className="h-64 bg-muted relative overflow-hidden group">
                                {project.images && project.images.length > 0 ? (
                                    <Image src={project.images[0]} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-muted to-card">🧪</div>
                                )}
                                <div className="absolute top-4 right-4 bg-background/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                                    {project.status || 'Active'}
                                </div>
                            </div>
                            <div className="p-8 flex-grow flex flex-col">
                                <h3 className="text-2xl font-bold text-foreground mb-4">{project.title}</h3>
                                <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">{project.description}</p>

                                {project.collaborators && (
                                    <div className="pt-6 border-t border-border">
                                        <span className="text-xs text-accent-500 uppercase tracking-widest font-bold mb-2 block">Collaborators</span>
                                        <p className="text-sm text-muted-foreground">{project.collaborators}</p>
                                    </div>
                                )}
                                {project.funding_source && (
                                    <div className="pt-4">
                                        <span className="text-xs text-primary-400 uppercase tracking-widest font-bold mb-1 block">Supported By</span>
                                        <p className="text-sm text-muted-foreground">{project.funding_source}</p>
                                    </div>
                                )}
                            </div>
                        </SpotlightCard>
                    </TiltCard>
                </motion.div>
            ))}
        </motion.div>
    );
};
