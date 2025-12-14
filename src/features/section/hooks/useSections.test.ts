import { renderHook, waitFor, act } from '@testing-library/react';
import { useSections } from './useSections';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock client structure defined inside hoist for safety, or referenced if hoisted
const { mockClient } = vi.hoisted(() => {
    return {
        mockClient: {
            models: {
                Section: {
                    list: vi.fn(),
                    create: vi.fn(),
                    update: vi.fn(),
                    delete: vi.fn()
                }
            }
        }
    }
});

// Mock generateClient from aws-amplify/data
vi.mock('aws-amplify/data', () => ({
    generateClient: () => mockClient
}));

describe('useSections Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches sections on mount if id provided', async () => {
        const mockSections = [{ id: '1', title: 'Test Section', type: 'custom', order: 0 }];
        mockClient.models.Section.list.mockResolvedValue({ data: mockSections, errors: null });

        const { result } = renderHook(() => useSections('kb-123'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.sections).toHaveLength(1);
        expect(result.current.sections[0].title).toBe('Test Section');
    });

    it('creates a new section', async () => {
        mockClient.models.Section.list.mockResolvedValue({ data: [], errors: null });
        const newSection = { id: 'new-1', title: 'New', type: 'custom', order: 0 };
        mockClient.models.Section.create.mockResolvedValue({ data: newSection, errors: null });

        const { result } = renderHook(() => useSections('kb-123'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.createSection({ title: 'New', type: 'custom' });
        });

        expect(mockClient.models.Section.create).toHaveBeenCalledWith(expect.objectContaining({
            knowledgeBaseId: 'kb-123',
            title: 'New',
            content: JSON.stringify({})
        }));
        expect(result.current.sections).toContainEqual(newSection);
    });

    it('updates a section with stringified content', async () => {
        const mockSection = { id: 's1', title: 'Old', type: 'custom', content: '{}' };
        mockClient.models.Section.update.mockResolvedValue({ data: { ...mockSection, title: 'Updated' }, errors: null });

        const { result } = renderHook(() => useSections('kb-123'));

        // Seed state manually for update testing since we can't easily mock list-then-update sequence without complex mocks
        // But useSections initialized with fetch, so we can mock list to return one item
        mockClient.models.Section.list.mockResolvedValue({ data: [mockSection], errors: null });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.updateSection('s1', { content: { some: 'data' } });
        });

        expect(mockClient.models.Section.update).toHaveBeenCalledWith(expect.objectContaining({
            id: 's1',
            content: JSON.stringify({ some: 'data' })
        }));
    });
    it('prevents creating duplicate section names', async () => {
        const existing = { id: '1', title: 'Skills', type: 'custom', content: '{}' };
        mockClient.models.Section.list.mockResolvedValue({ data: [existing], errors: null });

        const { result } = renderHook(() => useSections('kb-123'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await expect(
            result.current.createSection({ title: 'skills', type: 'custom' }) // Case-insensitive check
        ).rejects.toThrow('A section with the name "skills" already exists');
    });

    it('prevents renaming to a duplicate section name', async () => {
        const s1 = { id: '1', title: 'Skills', type: 'custom', content: '{}' };
        const s2 = { id: '2', title: 'Experience', type: 'custom', content: '{}' };
        mockClient.models.Section.list.mockResolvedValue({ data: [s1, s2], errors: null });

        const { result } = renderHook(() => useSections('kb-123'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await expect(
            result.current.updateSection('2', { title: 'Skills' })
        ).rejects.toThrow('A section with the name "Skills" already exists');
    });
});
