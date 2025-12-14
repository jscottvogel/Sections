import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import type { KnowledgeBase } from '../../../types';

const client = generateClient<Schema>();

/**
 * Hook to manage Knowledge Base entities.
 * Provides methods to fetch, create, and delete knowledge bases.
 * @returns Object containing the list of KBs, loading state, error, and CRUD methods.
 */
export function useKnowledgeBases() {
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchKnowledgeBases();
    }, []);

    async function fetchKnowledgeBases() {
        try {
            setLoading(true);
            const { data: items, errors } = await client.models.KnowledgeBase.list();
            if (errors) throw new Error(errors[0].message);
            setKnowledgeBases(items);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Creates a new Knowledge Base.
     * @param title - The title of the knowledge base.
     * @param description - Optional description.
     * @returns The created Knowledge Base object.
     */
    async function createKnowledgeBase(title: string, description?: string) {
        try {
            const { data: newKb, errors } = await client.models.KnowledgeBase.create({
                title,
                description,
            });
            if (errors) throw new Error(errors[0].message);
            if (!newKb) throw new Error('Failed to create Knowledge Base');

            setKnowledgeBases((prev) => [...prev, newKb]);
            return newKb;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }

    /**
     * Deletes a Knowledge Base by ID.
     * @param id - The ID of the knowledge base to delete.
     */
    async function deleteKnowledgeBase(id: string) {
        try {
            const { errors } = await client.models.KnowledgeBase.delete({ id });
            if (errors) throw new Error(errors[0].message);
            setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }

    return { knowledgeBases, loading, error, createKnowledgeBase, deleteKnowledgeBase };
}
