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
