import { defineFunction } from '@aws-amplify/backend';

export const parseResume = defineFunction({
    name: 'parseResume',
    entry: './handler.ts',
    timeoutSeconds: 60, // Bedrock calls can take a few seconds
});
