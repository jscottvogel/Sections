import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DocumentParser } from './DocumentParser';

const { mockParseResume } = vi.hoisted(() => {
    return { mockParseResume: vi.fn() };
});

vi.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        queries: {
            parseResume: mockParseResume
        }
    })
}));

describe('DocumentParser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parses file and maps response to ResumeDocument', async () => {
        // Mock FileReader
        const originalFileReader = window.FileReader;
        window.FileReader = class MockFileReader {
            result = '';
            onload = () => { };
            readAsDataURL() {
                this.result = 'data:application/pdf;base64,BASE64CONTENT';
                setTimeout(() => this.onload(), 0);
            }
        } as any;

        const mockResponseData = {
            contact_info: {
                fullName: "Test User",
                email: "test@example.com",
                location: "Test City"
            },
            summary: { heading: "Dev", summary: "Summary" },
            work_experience: [
                { role: "Engineer", company: "Test Corp" }
            ],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            volunteer: []
        };

        mockParseResume.mockResolvedValue({
            data: JSON.stringify(mockResponseData),
            errors: null
        });

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        const result = await DocumentParser.parse(file);

        // Verify API call
        expect(mockParseResume).toHaveBeenCalledWith({
            encodedFile: 'BASE64CONTENT',
            contentType: 'application/pdf'
        });

        // Verify Mapping
        expect(result.profile.name.full).toBe('Test User');
        expect(result.profile.contacts?.email).toBe('test@example.com');
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0].type).toBe('experience');
        expect(result.sections[0].items).toEqual([{ role: "Engineer", company: "Test Corp" }]);
        expect(result.document.parse_meta?.parser).toBe('bedrock-claude-3.5-sonnet');

        window.FileReader = originalFileReader;
    });

    it('throws error if API fails', async () => {
        const originalFileReader = window.FileReader;
        window.FileReader = class MockFileReader {
            result = '';
            onload = () => { };
            readAsDataURL() {
                this.result = 'data:application/pdf;base64,BASE64CONTENT';
                setTimeout(() => this.onload(), 0);
            }
        } as any;

        mockParseResume.mockResolvedValue({
            data: null,
            errors: [{ message: 'Backend Error' }]
        });

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        await expect(DocumentParser.parse(file)).rejects.toThrow('Backend Error');

        window.FileReader = originalFileReader;
    });
});
