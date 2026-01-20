import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-muted/40 backdrop-blur-md text-foreground border-t border-border pt-20 pb-10 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Brand */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/" className="text-3xl font-serif font-bold tracking-tight">
                            SK Lab<span className="text-accent">.</span>
                        </Link>
                        <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                            Advancing scientific discovery through rigorous research and interdisciplinary collaboration.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            {/* Social Icons Placeholders */}
                            <div className="w-10 h-10 rounded-full bg-background hover:bg-accent hover:text-accent-foreground transition flex items-center justify-center cursor-pointer shadow-sm border border-border">𝕏</div>
                            <div className="w-10 h-10 rounded-full bg-background hover:bg-accent hover:text-accent-foreground transition flex items-center justify-center cursor-pointer shadow-sm border border-border">In</div>
                            <div className="w-10 h-10 rounded-full bg-background hover:bg-accent hover:text-accent-foreground transition flex items-center justify-center cursor-pointer shadow-sm border border-border">G</div>
                        </div>
                    </div>

                    {/* Column 2: Navigation */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">Explore</h3>
                        <ul className="space-y-4">
                            <li><Link href="/lab" className="text-muted-foreground hover:text-foreground transition">The Lab</Link></li>
                            <li><Link href="/people" className="text-muted-foreground hover:text-foreground transition">Our Team</Link></li>
                            <li><Link href="/publications" className="text-muted-foreground hover:text-foreground transition">Publications</Link></li>
                            <li><Link href="/projects" className="text-muted-foreground hover:text-foreground transition">Projects</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact/Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">Connect</h3>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Work With Us</Link></li>
                            <li><Link href="/news" className="text-muted-foreground hover:text-foreground transition">Latest News</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Research Lab. All rights reserved.</p>
                    <p className="font-serif italic mt-2 md:mt-0">Designed for Science.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
