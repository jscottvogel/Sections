import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeParser } from './ResumeParser';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
    });

    it('renders correctly', () => {
        render(<ResumeParser />);
        expect(screen.getByText('Resume Parser Agent')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Paste resume text here...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Parse Resume/i })).toBeDisabled(); // Disabled initially because text is empty
    });

    it('enables button when text is entered', () => {
        render(<ResumeParser />);
        const textarea = screen.getByPlaceholderText('Paste resume text here...');
        fireEvent.change(textarea, { target: { value: 'My Resume Content' } });
        expect(screen.getByRole('button', { name: /Parse Resume/i })).toBeEnabled();
    });
});
