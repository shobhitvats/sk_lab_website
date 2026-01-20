export interface ProfessorProfile {
    name: string;
    title: string;
    affiliation: string;
    bio_short: string;
    bio_long: string;
    profile_photo?: string | null;
    email: string;
    google_scholar_url?: string | null;
    orcid?: string | null;
    twitter_url?: string | null;
    linkedin_url?: string | null;
    phone?: string | null;
    office_location?: string | null;
}

export interface LabInfo {
    lab_name: string;
    mission_statement: string;
    research_focus_areas: string[];
    lab_photo?: string | null;
    join_lab_text: string;
}

export interface Person {
    name: string;
    role: string;
    bio: string;
    photo?: string | null;
    start_year: number;
    end_year?: number | null;
    personal_website?: string | null;
    email?: string | null;
}

export interface Publication {
    title: string;
    authors: string;
    year: number;
    venue: string;
    abstract: string;
    doi?: string | null;
    pdf_link?: string | null;
    code_link?: string | null;
    bibtex?: string | null;
    tags: string[];
}

export interface Project {
    title: string;
    description: string;
    status: "Ongoing" | "Completed";
    related_publications: string[];
    images: string[];
    collaborators: string[];
    funding_source?: string | null;
}

export interface NewsItem {
    title: string;
    content: string;
    publish_date: string;
    featured: boolean;
}
