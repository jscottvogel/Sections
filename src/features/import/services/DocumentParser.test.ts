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

// Mock mammoth
vi.mock('mammoth', () => ({
    extractRawText: vi.fn().mockResolvedValue({ value: 'Extracted Resume Text' })
}));

describe('DocumentParser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('parses PDF file and calls backend with encodedFile', async () => {
        // Mock FileReader for base64
        const originalFileReader = window.FileReader;
        window.FileReader = class MockFileReader {
            result = '';
            onload = () => { };
            readAsDataURL() {
                this.result = 'data:application/pdf;base64,BASE64CONTENT';
                setTimeout(() => this.onload(), 0);
            }
        } as any;

        const mockResponseData = { contact_info: { fullName: "Test User" }, sections: [] };
        mockParseResume.mockResolvedValue({ data: JSON.stringify(mockResponseData), errors: null });

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        await DocumentParser.parse(file);

        expect(mockParseResume).toHaveBeenCalledWith({
            encodedFile: 'BASE64CONTENT',
            contentType: 'application/pdf',
            resumeText: undefined
        });

        window.FileReader = originalFileReader;
    });

    it('parses DOCX file and calls backend with resumeText', async () => {
        // Mock FileReader for ArrayBuffer
        const originalFileReader = window.FileReader;
        window.FileReader = class MockFileReader {
            result = new ArrayBuffer(8);
            onload = () => { };
            readAsArrayBuffer() {
                setTimeout(() => this.onload(), 0);
            }
        } as any;

        const mockResponseData = { contact_info: { fullName: "Test User" }, sections: [] };
        mockParseResume.mockResolvedValue({ data: JSON.stringify(mockResponseData), errors: null });

        const file = new File(['dummy'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        await DocumentParser.parse(file);

        // Verify mammoth usage (implicit by result) and API call
        expect(mockParseResume).toHaveBeenCalledWith({
            resumeText: 'Extracted Resume Text',
            encodedFile: undefined,
            contentType: undefined
        });

        window.FileReader = originalFileReader;
    });

    it('throws error if API fails', async () => {
        // ... existing test logic adapted ...
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
