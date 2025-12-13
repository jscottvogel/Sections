export const DEFAULT_SECTIONS = [
    'Contact', 'Summary', 'Experience', 'Education',
    'Skills', 'Projects', 'Certifications', 'Awards'
];

export const SECTION_TEMPLATES: Record<string, any> = {
    'Contact': { fullName: "", email: "", phone: "", linkedin: "", location: "" },
    'Summary': { professionalSummary: "" },
    'Experience': [{ company: "", role: "", startDate: "", endDate: "", description: "" }],
    'Education': [{ institution: "", degree: "", startDate: "", endDate: "" }],
    'Skills': [{ category: "Technical", items: [] }, { category: "Soft Skills", items: [] }],
    'Projects': [{ name: "", description: "", link: "" }],
    'Certifications': [{ name: "", issuer: "", date: "" }],
    'Awards': [{ title: "", issuer: "", date: "" }]
};
