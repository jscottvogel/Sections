import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionList } from './SectionList';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Section } from '../../../types';

describe('SectionList Component', () => {
    const mockCreateSection = vi.fn();
    const mockUpdateSection = vi.fn();
    const mockDeleteSection = vi.fn();

    // Cast to any to avoid strict typing on relationship fields like knowledgeBase for tests
    const mockSections: any[] = [
        { id: '1', title: 'Existing Section', type: 'custom', content: {}, order: 0, knowledgeBaseId: 'kb1', createdAt: '', updatedAt: '' }
    ];

    const defaultProps = {
        sections: mockSections as Section[],
        loading: false,
        onCreateSection: mockCreateSection,
        onUpdateSection: mockUpdateSection,
        onDeleteSection: mockDeleteSection
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing and shows sections', () => {
        render(<SectionList {...defaultProps} />);
        expect(screen.getByText('Existing Section')).toBeInTheDocument();
        expect(screen.getByText('Add Section')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<SectionList {...defaultProps} loading={true} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('calls onCreateSection with unique name when adding custom section', async () => {
        const user = userEvent.setup();
        render(<SectionList {...defaultProps} />);

        // Click Add Section
        await user.click(screen.getByText('Add Section'));

        // Click Custom Section (assuming "Custom Section" is the label for custom type)
        // We might need to check the actual text in the button if the label is different
        // Based on TEMPLATES, label is "Custom Section"
        const customBtn = screen.getByText('Custom Section');
        await user.click(customBtn);

        // Expectation: Should call create with "Custom Section" because "Custom Section" does not exist in mockSections
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Custom Section',
            type: 'custom'
        }));
    });

    it('increments name if base title exists', async () => {
        const user = userEvent.setup();
        const sectionsWithDuplicate: any[] = [
            ...mockSections,
            { id: '2', title: 'Custom Section', type: 'custom', content: {}, order: 1, knowledgeBaseId: 'kb1', createdAt: '', updatedAt: '' }
        ];

        render(<SectionList {...defaultProps} sections={sectionsWithDuplicate as Section[]} />);

        await user.click(screen.getByText('Add Section'));

        // Scope to the add menu to avoid clicking existing sections with same name
        const addMenu = screen.getByText('Choose Section Type').closest('div')!.parentElement!;
        const customBtn = within(addMenu).getByText('Custom Section');
        await user.click(customBtn);

        // "Custom Section" exists, so it should try "Custom Section 1"
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Custom Section 1',
            type: 'custom'
        }));
    });

    it('increments name correctly if number 1 also exists', async () => {
        const user = userEvent.setup();
        const sectionsWithDuplicates: any[] = [
            ...mockSections,
            { id: '2', title: 'Custom Section', type: 'custom', content: {}, order: 1, knowledgeBaseId: 'kb1', createdAt: '', updatedAt: '' },
            { id: '3', title: 'Custom Section 1', type: 'custom', content: {}, order: 2, knowledgeBaseId: 'kb1', createdAt: '', updatedAt: '' }
        ];

        render(<SectionList {...defaultProps} sections={sectionsWithDuplicates as Section[]} />);

        await user.click(screen.getByText('Add Section'));

        const addMenu = screen.getByText('Choose Section Type').closest('div')!.parentElement!;
        const customBtn = within(addMenu).getByText('Custom Section');
        await user.click(customBtn);

        // "Custom Section" and "Custom Section 1" exist, so "Custom Section 2"
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Custom Section 2',
            type: 'custom'
        }));
    });
});
