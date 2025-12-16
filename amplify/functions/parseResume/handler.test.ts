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
        await expect(handler(event)).rejects.toThrow(/Missing resumeText or encodedFile/);
    });

    it('should call Bedrock and return parsed JSON for text input', async () => {
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

    it('should call Bedrock and return parsed JSON for file input', async () => {
        const encodedFile = "base64data";
        const contentType = "application/pdf";
        const mockResponse = {
            content: [{ text: '{"name": "Jane Doe"}' }]
        };
        const responseBody = new TextEncoder().encode(JSON.stringify(mockResponse));

        mockSend.mockResolvedValueOnce({
            body: responseBody
        });

        const event = { arguments: { encodedFile, contentType } } as any;
        const result = await handler(event);

        expect(result).toBe('{"name": "Jane Doe"}');
        expect(InvokeModelCommand).toHaveBeenCalledTimes(1);

        // Check argument structure for document block
        const callArgs = vi.mocked(InvokeModelCommand).mock.calls[0][0];
        const body = JSON.parse(callArgs.body as string);
        expect(body.messages[0].content[0]).toMatchObject({
            type: "document",
            source: {
                type: "base64",
                media_type: "application/pdf",
                data: "base64data"
            }
        });
    });

    it('should throw error if contentType is missing for file input', async () => {
        const event = { arguments: { encodedFile: "data" } } as any;
        await expect(handler(event)).rejects.toThrow(/Missing contentType for encodedFile/);
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

    it('should extract JSON correctly even with preamble', async () => {
        const mockEvent = {
            arguments: {
                encodedFile: "dummyBase64",
                contentType: "application/pdf"
            }
        };

        const mockResponse = {
            content: [
                { text: "Here is the JSON you requested:\n\n{ \"contact_info\": { \"fullName\": \"John Doe\" } }\n\nHope this helps!" }
            ]
        };

        const encodedResponse = new TextEncoder().encode(JSON.stringify(mockResponse));

        // Mock send method
        mockSend.mockResolvedValueOnce({
            body: encodedResponse
        });

        const result = await handler(mockEvent as any);
        const parsedContext = JSON.parse(result);

        expect(parsedContext).toEqual({ contact_info: { fullName: "John Doe" } });
    });
});
