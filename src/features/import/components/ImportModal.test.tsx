import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportModal } from './ImportModal';
import { DocumentParser } from '../services/DocumentParser';
import type { ResumeDocument } from '../../../types';

// Mock the DocumentParser
vi.mock('../services/DocumentParser');

const mockParsedData: ResumeDocument = {
    schema_version: '1.0',
    document: {
        resume_id: '1',
        language: 'en',
        created_at: '',
        updated_at: '',
        source: { type: 'pdf', filename: 'resume.pdf', page_count: 1 }
    },
    profile: { name: { full: 'Test User' }, headline: 'Developer' },
    sections: [{ id: '1', type: 'custom', label: 'Test Section' }]
};

describe('ImportModal', () => {
    const mockOnClose = vi.fn();
    const mockOnImport = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);
        expect(screen.getByText('AI Document Import')).toBeInTheDocument();
        expect(screen.getByText('Click to upload resume (PDF/DOCX)')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ImportModal isOpen={false} onClose={mockOnClose} onImport={mockOnImport} />);
        expect(screen.queryByText('AI Document Import')).not.toBeInTheDocument();
    });

    it('calls onImport and closes on success', async () => {
        vi.mocked(DocumentParser.parse).mockResolvedValue(mockParsedData);
        mockOnImport.mockResolvedValue(undefined);

        render(<ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByTestId('file-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => expect(screen.getByText('Analysis Complete')).toBeInTheDocument());

        const importBtn = screen.getByText('Import Data');
        fireEvent.click(importBtn);

        await waitFor(() => expect(mockOnImport).toHaveBeenCalledWith(mockParsedData));
        await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    });

    it('shows error if onImport fails', async () => {
        vi.mocked(DocumentParser.parse).mockResolvedValue(mockParsedData);
        mockOnImport.mockRejectedValue(new Error('Save failed'));

        render(<ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByTestId('file-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => expect(screen.getByText('Import Data')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Import Data'));

        // Wait for error text
        const errorMsg = await screen.findByText(/Failed to save import: Save failed/i, {}, { timeout: 3000 });
        expect(errorMsg).toBeInTheDocument();
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
