import type { ResumeDocument } from "../../../types";

/**
 * Service to handle document parsing.
 * Currently mocks the AI agent interaction.
 */
export class DocumentParser {
    static async parse(_file: File): Promise<ResumeDocument> {
        return new Promise((resolve) => {
            // Simulate AI processing delay
            setTimeout(() => {
                resolve(MOCK_RESUME_DATA);
            }, 3000);
        });
    }
}

const MOCK_RESUME_DATA: ResumeDocument = {
    schema_version: "1.0.0",
    document: {
        resume_id: "mock-id-123",
        language: "en",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: {
            type: "pdf",
            filename: "resume.pdf",
            page_count: 2
        }
    },
    profile: {
        name: { full: "Alex Doe", first: "Alex", last: "Doe" },
        headline: "Senior Software Engineer",
        summary: "Full stack developer with 8 years of experience building scalable web applications.",
        location: { city: "San Francisco", region: "CA", country: "USA" },
        contacts: {
            email: "alex@example.com",
            phone: "+1 (555) 012-3456",
            linkedin: "https://linkedin.com/in/alexdoe"
        }
    },
    sections: [
        {
            id: "exp-1",
            type: "experience",
            label: "Senior Developer at Tech Corp",
            order: 0,
            items: [
                {
                    title: "Senior Developer",
                    organization: "Tech Corp",
                    date_start: "2020-01",
                    date_end: "Present",
                    description: "Leading frontend development for core products.",
                    highlights: [
                        "Improved load times by 40%",
                        "Mentored 5 junior developers"
                    ]
                }
            ]
        },
        {
            id: "edu-1",
            type: "education",
            label: "BS Computer Science",
            order: 1,
            items: [
                {
                    institution: "University of Technology",
                    degree: "Bachelor of Science",
                    field: "Computer Science",
                    date_end: "2019-05"
                }
            ]
        }
    ]
};
