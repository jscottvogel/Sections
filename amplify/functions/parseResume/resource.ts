import { defineFunction } from '@aws-amplify/backend';

export const parseResume = defineFunction({
    name: 'parseResume',
    entry: './handler.ts',
    timeoutSeconds: 900, // 15 minutes for large PDF processing
    memoryMB: 2048, // Ensure enough RAM for base64 handling
});
