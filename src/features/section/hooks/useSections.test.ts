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
            title: 'New'
        }));
        expect(result.current.sections).toContainEqual(newSection);
    });
});
