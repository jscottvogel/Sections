import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './handler';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const { mockSend } = vi.hoisted(() => {
    return { mockSend: vi.fn() };
});

// Mock the Bedrock client
vi.mock('@aws-sdk/client-bedrock-runtime', () => {
    return {
        BedrockRuntimeClient: class {
            send = mockSend;
        },
        InvokeModelCommand: vi.fn(),
    };
});

describe('handler', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw an error if resumeText is missing', async () => {
        const event = { arguments: {} } as any;
        await expect(handler(event)).rejects.toThrow(/Missing resumeText/);
    });

    it('should call Bedrock and return parsed JSON', async () => {
        const resumeText = "My Resume";
        const mockResponse = {
            content: [{ text: '{"name": "John Doe"}' }]
        };
        const responseBody = new TextEncoder().encode(JSON.stringify(mockResponse));

        mockSend.mockResolvedValueOnce({
            body: responseBody
        });

        const event = { arguments: { resumeText } } as any;
        const result = await handler(event);

        expect(result).toBe('{"name": "John Doe"}');
        expect(InvokeModelCommand).toHaveBeenCalledTimes(1);
    });

    it('should handle markdown code blocks from Bedrock', async () => {
        const resumeText = "My Resume";
        const mockResponse = {
            content: [{ text: '```json\n{"name": "John Doe"}\n```' }]
        };
        const responseBody = new TextEncoder().encode(JSON.stringify(mockResponse));

        mockSend.mockResolvedValueOnce({
            body: responseBody
        });

        const event = { arguments: { resumeText } } as any;
        const result = await handler(event);

        expect(result).toBe('{"name": "John Doe"}');
    });

    it('should throw error if Bedrock fails', async () => {
        const resumeText = "My Resume";
        mockSend.mockRejectedValueOnce(new Error('Bedrock Error'));

        const event = { arguments: { resumeText } } as any;
        await expect(handler(event)).rejects.toThrow('Error parsing resume: Bedrock Error');
    });
});
