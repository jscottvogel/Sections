import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import type { Section } from '../../../types';

const client = generateClient<Schema>();

/**
 * Hook to manage Sections within a specific Knowledge Base.
 * @param knowledgeBaseId - The ID of the Knowledge Base to fetch sections for.
 * @returns Object containing info about sections, loading state, error, and CRUD methods.
 */
export function useSections(knowledgeBaseId: string | undefined) {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper to ensure content is always a valid object
    const normalizeSection = (section: Section): Section => {
        if (typeof section.content === 'string') {
            try {
                return { ...section, content: JSON.parse(section.content) };
            } catch (e) {
                console.warn(`Failed to parse content for section ${section.id}`, e);
                return { ...section, content: {} };
            }
        }
        return section;
    };

    const fetchSections = useCallback(async () => {
        if (!knowledgeBaseId) return;
        try {
            setLoading(true);
            // Amplify gen2 client syntax for fetching related or filtering
            const { data: items, errors } = await client.models.Section.list({
                filter: {
                    knowledgeBaseId: { eq: knowledgeBaseId }
                }
            });
            if (errors) throw new Error(errors[0].message);

            // Sort in memory by order and normalize content
            const sorted = items
                .map(normalizeSection)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            setSections(sorted);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [knowledgeBaseId]);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    /**
     * Creates a new section.
     * @param data - The section data (title, type, content).
     * @returns The created section.
     */
    async function createSection(data: { title: string; type: string; content?: any }) {
        if (!knowledgeBaseId) return;
        try {
            const normalizedTitle = data.title.trim();
            const isDuplicate = sections.some(s => s.title.toLowerCase() === normalizedTitle.toLowerCase());
            if (isDuplicate) {
                throw new Error(`A section with the name "${normalizedTitle}" already exists.`);
            }

            const order = sections.length;
            const { data: newSection, errors } = await client.models.Section.create({
                knowledgeBaseId,
                title: normalizedTitle,
                type: data.type,
                content: JSON.stringify(data.content || {}),
                order
            });
            if (errors) throw new Error(errors[0].message);
            if (!newSection) throw new Error('Failed to create section');

            const normalized = normalizeSection(newSection);
            setSections(prev => [...prev, normalized]);
            return normalized;
        } catch (err: any) {
            console.error("Error in createSection hook:", err);
            setError(err.message);
            throw err;
        }
    }

    /**
     * Updates an existing section.
     * @param id - The ID of the section to update.
     * @param updates - Partial section object with updates.
     */
    async function updateSection(id: string, updates: Partial<Section>) {
        try {
            if (updates.title) {
                const normalizedTitle = updates.title.trim();
                const isDuplicate = sections.some(s => s.id !== id && s.title.toLowerCase() === normalizedTitle.toLowerCase());
                if (isDuplicate) {
                    throw new Error(`A section with the name "${normalizedTitle}" already exists.`);
                }
                updates.title = normalizedTitle;
            }

            // Ensure content is stringified if present, as it is an AWSJSON field
            const payload = { ...updates };
            if (payload.content) {
                payload.content = JSON.stringify(payload.content);
            }

            const { data: updated, errors } = await client.models.Section.update({
                id,
                ...payload
            });
            if (errors) throw new Error(errors[0].message);
            if (!updated) throw new Error('Failed to update section');

            const normalized = normalizeSection(updated);
            setSections(prev => prev.map(s => s.id === id ? normalized : s));
        } catch (err: any) {
            console.error("Error in updateSection hook:", err);
            setError(err.message);
            throw err;
        }
    }

    async function deleteSection(id: string) {
        try {
            const { errors } = await client.models.Section.delete({ id });
            if (errors) throw new Error(errors[0].message);
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }

    return { sections, loading, error, createSection, updateSection, deleteSection, refresh: fetchSections };
}
