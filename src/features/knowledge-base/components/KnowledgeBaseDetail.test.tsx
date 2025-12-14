import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeBaseDetail } from './KnowledgeBaseDetail';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useParams, useNavigate } from 'react-router-dom';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useSections } from '../../section/hooks/useSections';
import { Amplify } from 'aws-amplify';

// Define mock client using vi.hoisted for proper hoisting behavior
const { mockClient } = vi.hoisted(() => {
    return {
        mockClient: {
            models: {
                KnowledgeBase: { get: vi.fn(), update: vi.fn() },
                Section: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }
            }
        }
    }
});

vi.mock('aws-amplify/data', () => ({
    generateClient: () => mockClient
}));

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn()
}));

vi.mock('aws-amplify', () => ({
    Amplify: { configure: vi.fn() }
}));

vi.mock('../hooks/useKnowledgeBase', () => ({
    useKnowledgeBase: vi.fn()
}));
vi.mock('../../section/hooks/useSections', () => ({
    useSections: vi.fn()
}));
vi.mock('../../section/components/SectionList', () => ({
    SectionList: () => <div data-testid="section-list">Section List</div>
}));

// Mock ImportModal to isolate integration logic
// We use type 'experience' to test aggregation into a standard "Experience" section
vi.mock('../../import/components/ImportModal', () => ({
    ImportModal: ({ isOpen, onImport }: any) => isOpen ? (
        <div data-testid="mock-import-modal">
            <button onClick={() => onImport({
                sections: [
                    { label: 'Job 1', type: 'experience', items: [{ role: 'Dev' }] },
                    { label: 'Job 2', type: 'experience', items: [{ role: 'QA' }] }
                ],
                profile: { name: { full: 'Imported User' } }
            })}>
                Trigger Import
            </button>
        </div>
    ) : null
}));

describe('KnowledgeBaseDetail JSON Sync & Import', () => {
    const mockUpdateKB = vi.fn();
    const mockCreateSection = vi.fn();
    const mockUpdateSection = vi.fn();
    const mockDeleteSection = vi.fn();
    const mockNavigate = vi.fn();

    const mockKB = {
        id: 'kb1',
        title: 'Test KB',
        description: 'Description',
        metadata: {
            profile: { name: { full: 'Test User' } }
        }
    };

    const mockSections = [
        { id: 's1', title: 'Section 1', type: 'custom', content: { items: [] }, order: 0, knowledgeBaseId: 'kb1' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Force config to avoid errors if real Amplify is hit
        Amplify.configure({
            API: {
                GraphQL: {
                    endpoint: 'https://dummy.appsync-api.us-east-1.amazonaws.com/graphql',
                    region: 'us-east-1',
                    defaultAuthMode: 'apiKey',
                    apiKey: 'da2-fake'
                }
            }
        });

        (useParams as any).mockReturnValue({ id: 'kb1' });
        (useNavigate as any).mockReturnValue(mockNavigate);

        (useKnowledgeBase as any).mockReturnValue({
            knowledgeBase: mockKB,
            loading: false,
            updateKB: mockUpdateKB,
            error: null,
            refresh: vi.fn()
        });

        (useSections as any).mockReturnValue({
            sections: mockSections,
            createSection: mockCreateSection,
            updateSection: mockUpdateSection,
            deleteSection: mockDeleteSection,
            loading: false
        });
    });

    it('renders and switches to JSON view showing full document', async () => {
        render(<KnowledgeBaseDetail />);

        // Switch to JSON view
        const jsonBtn = screen.getByRole('button', { name: /JSON/i });
        fireEvent.click(jsonBtn);

        const textarea = screen.getByRole('textbox');
        const json = JSON.parse((textarea as HTMLTextAreaElement).value);

        // Should have metadata merged
        expect(json.profile.name.full).toBe('Test User');
        // Should have sections
        expect(json.sections).toHaveLength(1);
    });

    it('syncs metadata to KB and sections to DB on save', async () => {
        const user = userEvent.setup();
        render(<KnowledgeBaseDetail />);

        // Switch to JSON
        const jsonBtn = screen.getByRole('button', { name: /JSON/i });
        fireEvent.click(jsonBtn);

        const textarea = screen.getByRole('textbox');
        const existingVal = JSON.parse((textarea as HTMLTextAreaElement).value);

        // Modify metadata
        existingVal.profile.name.full = "Updated User";
        // Add a section
        existingVal.sections.push({
            // No ID = new
            label: 'New Section',
            type: 'experience',
            items: [{ role: 'Dev' }]
        });

        const newVal = JSON.stringify(existingVal, null, 2);
        fireEvent.change(textarea, { target: { value: newVal } });

        // Click Sync
        const syncBtn = screen.getByRole('button', { name: /Sync Changes/i });
        await user.click(syncBtn);

        // Verify updateKB called with stringified metadata
        expect(mockUpdateKB).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.any(String)
        }));

        const callArg = JSON.parse(mockUpdateKB.mock.calls[0][0].metadata);
        expect(callArg.profile.name.full).toBe('Updated User');

        // Verify createSection called for new section
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: 'New Section',
            type: 'experience',
            content: expect.objectContaining({ items: [{ role: 'Dev' }] })
        }));
    });

    it('aggregates sections by type and resolves duplicates for the group', async () => {
        const user = userEvent.setup();
        // Mock createSection to simulate error on first call (duplicate) then success
        mockCreateSection.mockImplementation(async (data) => {
            // Simulate backend error if title is 'Experience' (default for type 'experience')
            if (data.title === 'Experience') throw new Error('A section with the name "Experience" already exists.');
            return { id: 'created_after_retry', ...data };
        });

        render(<KnowledgeBaseDetail />);

        const aiBtn = screen.getByText(/Ai Import/i);
        await user.click(aiBtn);

        const triggerBtn = screen.getByText('Trigger Import');
        await user.click(triggerBtn);

        // Verify metadata update
        expect(mockUpdateKB).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.any(String)
        }));

        // Verify createSection was called with the aggregated section
        // 1st call: Title "Experience" (failed)
        // 2nd call: Title "Experience (Imported...)" (succeeded)

        // Verify duplicate check success
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: expect.stringContaining('Experience (Imported'),
            type: 'experience',
            // Content should contain BOTH items
            content: expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({ role: 'Dev' }),
                    expect.objectContaining({ role: 'QA' })
                ])
            })
        }));
    });

    it('continues to create sections even if metadata update fails', async () => {
        // Suppress console error for this test as we expect it
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const user = userEvent.setup();

        // Mock updateKB to fail
        mockUpdateKB.mockRejectedValue(new Error('Invalid Metadata'));
        mockCreateSection.mockResolvedValue({ id: 'new' });

        render(<KnowledgeBaseDetail />);

        const aiBtn = screen.getByText(/Ai Import/i);
        await user.click(aiBtn);
        const triggerBtn = screen.getByText('Trigger Import');
        await user.click(triggerBtn);

        // Verify metadata update was attempted
        expect(mockUpdateKB).toHaveBeenCalled();

        // Verify sections were STILL created (Aggregated as 'Experience')
        expect(mockCreateSection).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Experience',
            content: expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({ role: 'Dev' }),
                    expect.objectContaining({ role: 'QA' })
                ])
            })
        }));

        consoleSpy.mockRestore();
    });
});
