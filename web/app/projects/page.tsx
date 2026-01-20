import { getProjects } from '@/lib/api';
import { FloatingShapes } from '@/components/ui/FloatingShapes';
import { ProjectsList } from '@/components/ProjectsList';


export default async function Projects() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen text-foreground pt-32 pb-20 selection:bg-accent-500 selection:text-white">
            <FloatingShapes />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-20 text-center">
                    <h2 className="text-accent-400 font-medium tracking-[0.3em] uppercase text-xs animate-fade-in mb-4">Current Work</h2>
                    <h1 className="text-6xl md:text-8xl font-serif text-foreground animate-fade-in-up">
                        Projects
                    </h1>
                </header>

                <ProjectsList projects={projects} />
            </div>
        </div>
    );
}
