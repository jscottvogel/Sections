import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import type { KnowledgeBase } from '../../../types';

const client = generateClient<Schema>();

export function useKnowledgeBase(id: string | undefined) {
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchKB();
    }, [id]);

    async function fetchKB() {
        if (!id) return;
        try {
            setLoading(true);
            const { data, errors } = await client.models.KnowledgeBase.get({ id });
            if (errors) throw new Error(errors[0].message);
            setKnowledgeBase(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { knowledgeBase, loading, error, refresh: fetchKB };
}
