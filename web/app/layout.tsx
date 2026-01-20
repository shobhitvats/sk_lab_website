import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GlobalSearch } from "@/components/GlobalSearch";
import { getPeople, getProjects, getNews } from "@/lib/api";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { GridBackground } from "@/components/ui/GridBackground";
import { Preloader } from "@/components/ui/Preloader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AIChatWidget } from "@/components/AIChatWidget";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { FluidCursor } from "@/components/ui/FluidCursor";


const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

// Dynamic Metadata
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const dataPath = path.join(process.cwd(), '../data/lab_info.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const title = data.seo_title || "SK Research Lab";
      const desc = data.seo_description || "A leading research laboratory.";
      return {
        title: title,
        description: desc,
        openGraph: {
          title: title,
          description: desc,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: title,
          description: desc,
        }
      };
    }
  } catch (e) {
    console.error("Error reading seo:", e);
  }
  return {
    title: "SK Research Lab",
    description: "Innovative Research in Computer Science"
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data for global search
  const people = await getPeople();
  const projects = await getProjects();
  const news = await getNews();

  const searchItems = [
    // Pages
    { id: 'page-home', title: 'Home', type: 'page', url: '/' },
    { id: 'page-lab', title: 'Lab Info', type: 'page', url: '/lab' },
    { id: 'page-people', title: 'People', type: 'page', url: '/people' },
    { id: 'page-projects', title: 'Projects', type: 'page', url: '/projects' },
    { id: 'page-publications', title: 'Publications', type: 'page', url: '/publications' },
    { id: 'page-news', title: 'News', type: 'page', url: '/news' },
    { id: 'page-contact', title: 'Contact', type: 'page', url: '/contact' },

    // People
    ...people.map((p, i) => ({ id: `person-${i}`, title: p.name, type: 'person', url: '/people' })),

    // Projects
    ...projects.map((p, i) => ({ id: `project-${i}`, title: p.title, type: 'project', url: '/projects' })),

    // News
    ...news.map((n, i) => ({ id: `news-${i}`, title: n.title, type: 'news', url: '/news' })),
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <div className="fixed inset-0 z-0 bg-background transition-colors duration-500" />
            <GridBackground />
            <div className="fixed inset-0 z-[1] opacity-60 pointer-events-none">
              <ParticleBackground />
            </div>
            <Preloader />
            <GrainOverlay />

            <ScrollProgress />
            <Navbar />
            <GlobalSearch items={searchItems as any} />
            <AIChatWidget />

            {/* Main content z-10 relative. Removed backdrop-blur to show ParticleBackground cleanly */}
            <main className="flex-grow z-10 relative bg-background/0 mb-0 shadow-2xl border-b border-white/5">
              {children}
            </main>

            {/* Standard Global Footer */}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
