import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeParser } from './ResumeParser';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Fix for jsdom not implementing TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

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

describe('ResumeParser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockParseResume.mockResolvedValue({ data: '{}', errors: null });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders with "Upload File" mode by default', () => {
        render(<ResumeParser />);
        expect(screen.getByText('Resume Parser Agent')).toBeInTheDocument();
        expect(screen.getByText('Upload File')).toHaveClass('bg-blue-100');
        expect(screen.getByText('Supported formats: PDF, DOC, DOCX, TXT')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Paste resume text here...')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Parse Resume/i })).toBeDisabled();
    });

    it('switches to text mode and enables button on input', () => {
        render(<ResumeParser />);
        const textModeBtn = screen.getByRole('button', { name: /Paste Text/i });
        fireEvent.click(textModeBtn);

        expect(screen.getByPlaceholderText('Paste resume text here...')).toBeInTheDocument();

        const textarea = screen.getByPlaceholderText('Paste resume text here...');
        fireEvent.change(textarea, { target: { value: 'My Resume' } });

        expect(screen.getByRole('button', { name: /Parse Resume/i })).toBeEnabled();
    });

    it('calls parseResume with text when in text mode', async () => {
        render(<ResumeParser />);
        fireEvent.click(screen.getByRole('button', { name: /Paste Text/i }));

        fireEvent.change(screen.getByPlaceholderText('Paste resume text here...'), { target: { value: 'My Resume' } });
        fireEvent.click(screen.getByRole('button', { name: /Parse Resume/i }));

        await waitFor(() => {
            expect(mockParseResume).toHaveBeenCalledWith({
                resumeText: 'My Resume',
                encodedFile: undefined,
                contentType: undefined
            });
        });
    });

    it('calls parseResume with encodedFile when in file mode', async () => {
        render(<ResumeParser />);

        // Mock FileReader
        const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });

        // Mocking FileReader inside the test scope
        const originalFileReader = window.FileReader;
        window.FileReader = class MockFileReader {
            result = '';
            onload = () => { };
            readAsDataURL() {
                this.result = 'data:application/pdf;base64,BASE64CONTENT';
                setTimeout(() => this.onload(), 0);
            }
        } as any;

        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) throw new Error("File input not found");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => expect(screen.getByRole('button', { name: /Parse Resume/i })).toBeEnabled());

        fireEvent.click(screen.getByRole('button', { name: /Parse Resume/i }));

        await waitFor(() => {
            expect(mockParseResume).toHaveBeenCalledWith({
                resumeText: undefined,
                encodedFile: 'BASE64CONTENT',
                contentType: 'application/pdf'
            });
        });

        window.FileReader = originalFileReader;
    });
});
