import { defineFunction } from '@aws-amplify/backend';

export const parseResume = defineFunction({
    name: 'parseResume',
    entry: './handler.ts',
    timeoutSeconds: 300, // 5 minutes for large PDF processing
    memoryMB: 512, // Ensure enough RAM for base64 handling
});
