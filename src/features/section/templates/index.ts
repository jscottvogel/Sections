import type { SectionType } from '../../../types';

export interface FieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'checkbox' | 'url' | 'email' | 'tel';
    required?: boolean;
    placeholder?: string;
}

export interface SectionTemplateDef {
    type: SectionType;
    label: string;
    description: string;
    isCollection: boolean; // true if it stores a list of items (e.g. Experience), false if single (e.g. Contact)
    itemLabel?: string; // e.g. "Job" for Experience
    fields: FieldDefinition[];
}

export const TEMPLATES: Record<SectionType, SectionTemplateDef> = {
    contact_info: {
        type: 'contact_info',
        label: 'Contact Information',
        description: 'Your personal details and how to reach you.',
        isCollection: false,
        fields: [
            { name: 'fullName', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'tel' },
            { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. New York, NY' },
            { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
            { name: 'portfolio', label: 'Portfolio URL', type: 'url' },
        ]
    },
    summary: {
        type: 'summary',
        label: 'Professional Summary',
        description: 'A brief overview of your career and goals.',
        isCollection: false,
        fields: [
            { name: 'heading', label: 'Heading', type: 'text', placeholder: 'e.g. Senior Software Engineer' },
            { name: 'summary', label: 'Summary', type: 'textarea', required: true, placeholder: 'Briefly describe your professional background...' },
        ]
    },
    experience: {
        type: 'experience',
        label: 'Work Experience',
        description: 'Your past roles and employment history.',
        isCollection: true,
        itemLabel: 'Role',
        fields: [
            { name: 'role', label: 'Job Title', type: 'text', required: true },
            { name: 'company', label: 'Company', type: 'text', required: true },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'startDate', label: 'Start Date', type: 'date', required: true },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'isCurrent', label: 'I currently work here', type: 'checkbox' },
            { name: 'description', label: 'Description', type: 'textarea' },
        ]
    },
    education: {
        type: 'education',
        label: 'Education',
        description: 'Degrees, schools, and academic achievements.',
        isCollection: true,
        itemLabel: 'School',
        fields: [
            { name: 'institution', label: 'Institution', type: 'text', required: true },
            { name: 'degree', label: 'Degree', type: 'text', required: true },
            { name: 'fieldOfStudy', label: 'Field of Study', type: 'text' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'graduationDate', label: 'Graduation Date', type: 'date' },
            { name: 'details', label: 'Additional Details', type: 'textarea', placeholder: 'GPA, Honors, etc.' },
        ]
    },
    skills: {
        type: 'skills',
        label: 'Skills',
        description: 'Technical and professional skills.',
        isCollection: true,
        itemLabel: 'Skill Category',
        fields: [
            { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Programming Languages' },
            { name: 'items', label: 'Skills', type: 'text', placeholder: 'Comma separated list (e.g. JS, React, Node)' },
        ]
    },
    projects: {
        type: 'projects',
        label: 'Projects',
        description: 'Personal or professional projects.',
        isCollection: true,
        itemLabel: 'Project',
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', required: true },
            { name: 'link', label: 'Link', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'technologies', label: 'Technologies', type: 'text' },
        ]
    },
    certifications: {
        type: 'certifications',
        label: 'Certifications',
        description: 'Professional certificates and licenses.',
        isCollection: true,
        itemLabel: 'Certificate',
        fields: [
            { name: 'name', label: 'Certification Name', type: 'text', required: true },
            { name: 'issuer', label: 'Issuer', type: 'text', required: true },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'expirationDate', label: 'Expiration', type: 'date' },
            { name: 'url', label: 'Credential URL', type: 'url' },
        ]
    },
    volunteer: {
        type: 'volunteer',
        label: 'Volunteer Work',
        description: 'Community service and volunteer roles.',
        isCollection: true,
        itemLabel: 'Role',
        fields: [
            { name: 'role', label: 'Role', type: 'text', required: true },
            { name: 'organization', label: 'Organization', type: 'text', required: true },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'description', label: 'Description', type: 'textarea' },
        ]
    },
    custom: {
        type: 'custom',
        label: 'Custom Section',
        description: 'Create your own section.',
        isCollection: true, // Default to collection for flexibility, or we treat broadly
        itemLabel: 'Item',
        fields: [
            { name: 'name', label: 'Name', type: 'text', placeholder: 'e.g. API Key' },
            { name: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 123-abc' }
        ]
    }
};
