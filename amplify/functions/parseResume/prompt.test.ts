import { describe, it, expect } from 'vitest';
import { createPrompt } from './prompt';

describe('createPrompt', () => {
    it('should include the resume text in the prompt', () => {
        const resumeText = "John Doe\nSoftware Engineer";
        const prompt = createPrompt(resumeText);
        expect(prompt).toContain(resumeText);
    });

    it('should include strict JSON structure requirements', () => {
        const prompt = createPrompt("test");
        expect(prompt).toContain('"contact_info": {');
        expect(prompt).toContain('"work_experience": [');
        expect(prompt).toContain('"education": [');
        expect(prompt).toContain('"skills": [');
        expect(prompt).toContain('Return ONLY the raw JSON object');
    });

    it('should handle empty string gracefully', () => {
        const prompt = createPrompt("");
        expect(prompt).not.toContain("Resume Text:");
        expect(prompt).toContain("REQUIRED JSON STRUCTURE:");
    });

    it('should include attached document instruction', () => {
        const prompt = createPrompt();
        expect(prompt).toContain('attached resume document (PDF/Image)');
    });
});
