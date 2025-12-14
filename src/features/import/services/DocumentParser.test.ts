import { describe, it, expect, vi } from 'vitest';
import { DocumentParser } from './DocumentParser';

describe('DocumentParser', () => {
    it('parses a file and returns the mock resume document', async () => {
        vi.useFakeTimers();
        const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });

        const promise = DocumentParser.parse(file);

        // Fast-forward time to bypass the 3000ms delay in mock
        vi.runAllTimers();

        const result = await promise;

        expect(result).toBeDefined();
        expect(result.schema_version).toMatch(/1\.0/);
        expect(result.profile.name.full).toBeDefined();
        vi.useRealTimers();
    });
});
