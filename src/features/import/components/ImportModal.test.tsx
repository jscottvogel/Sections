import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        const user = userEvent.setup();
        vi.mocked(DocumentParser.parse).mockResolvedValue(mockParsedData);
        mockOnImport.mockResolvedValue(undefined);

        render(<ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);

        // 1. Upload
        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByTestId('file-upload');
        await user.upload(input, file);

        // 2. Wait for Review state (skipping analyzing check due to speed)
        await waitFor(() => expect(screen.getByText('Analysis Complete')).toBeInTheDocument());

        // 3. Click Import
        const importBtn = screen.getByText('Import Data');
        await user.click(importBtn);

        // 4. Verify onImport called
        await waitFor(() => expect(mockOnImport).toHaveBeenCalledWith(mockParsedData));

        // 5. Verify Close called
        await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    });

    it('shows error if onImport fails', async () => {
        const user = userEvent.setup();
        vi.mocked(DocumentParser.parse).mockResolvedValue(mockParsedData);
        mockOnImport.mockRejectedValue(new Error('Save failed'));

        render(<ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />);

        const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
        const input = screen.getByTestId('file-upload');
        await user.upload(input, file);

        await waitFor(() => expect(screen.getByText('Import Data')).toBeInTheDocument());

        await user.click(screen.getByText('Import Data'));

        await waitFor(() => expect(screen.getByText('Failed to save import: Save failed')).toBeInTheDocument());
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
