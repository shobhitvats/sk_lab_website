import fs from 'fs';
import path from 'path';
import { ProfessorProfile, LabInfo, Person, Publication, Project, NewsItem } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data');

function readJson<T>(filename: string, defaultValue: T): T {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return defaultValue;
    }
}

export async function getProfile(): Promise<ProfessorProfile> {
    return readJson<ProfessorProfile>('profile.json', {
        name: "Professor Name",
        title: "Title",
        affiliation: "Affiliation",
        bio_short: "Bio...",
        bio_long: "",
        email: "email@example.com"
    });
}

export async function getLabInfo(): Promise<LabInfo> {
    return readJson<LabInfo>('lab_info.json', {
        lab_name: "My Lab",
        mission_statement: "",
        research_focus_areas: [],
        join_lab_text: ""
    });
}

export async function getPeople(): Promise<Person[]> {
    const all = readJson<Person[]>('people.json', []);
    return all.filter((x: Person & { visible?: boolean }) => x.visible !== false);
}

export async function getPublications(): Promise<Publication[]> {
    const all = readJson<Publication[]>('publications.json', []);
    return all.filter((x: Publication & { visible?: boolean }) => x.visible !== false);
}

export async function getProjects(): Promise<Project[]> {
    const all = readJson<Project[]>('projects.json', []);
    return all.filter((x: Project & { visible?: boolean }) => x.visible !== false);
}

export async function getNews(): Promise<NewsItem[]> {
    const all = readJson<NewsItem[]>('news.json', []);
    return all.filter((x: NewsItem & { visible?: boolean }) => x.visible !== false);
}
