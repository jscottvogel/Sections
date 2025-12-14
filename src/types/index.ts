import type { Schema } from '../../amplify/data/resource';

export type KnowledgeBase = Schema['KnowledgeBase']['type'];
export type Section = Schema['Section']['type'];

export type SectionType =
    | 'contact_info'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'volunteer'
    | 'custom';

export interface SectionTemplate {
    type: SectionType;
    label: string;
    description: string;
    defaultContent: Record<string, any>;
}
export interface ResumeDocument {
    schema_version: string;
    document: {
        resume_id: string;
        language: string;
        created_at: string;
        updated_at: string;
        source?: {
            type: string;
            filename: string;
            hash_sha256?: string;
            page_count?: number;
        };
        parse_meta?: {
            parser: string;
            model: string;
            confidence_overall?: number;
            notes?: string;
        };
    };
    profile: {
        name: {
            full: string;
            first?: string;
            middle?: string;
            last?: string;
            suffix?: string;
        };
        headline?: string;
        summary?: string;
        location?: {
            city?: string;
            region?: string;
            country?: string;
        };
        contacts?: {
            email?: string;
            phone?: string;
            website?: string;
            linkedin?: string;
            github?: string;
            other_links?: Array<{ label: string; url: string }>;
        };
    };
    sections: ResumeSection[];
    sources?: any[];
    normalization?: any;
    validation?: any;
}

// Map our DB Section to ResumeSection structure where possible, 
// but note DB Section has 'content' (any) while ResumeSection is explicit.
export interface ResumeSection {
    id: string;
    type: string;
    label: string;
    order?: number;
    items?: any[];
    definition?: any;
}
