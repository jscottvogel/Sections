// AppSync passes arguments in event.arguments
import type { AppSyncResolverEvent } from "aws-lambda";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedRockClient = new BedrockRuntimeClient({ region: "us-east-1" });

import { createPrompt } from './prompt';

export const handler = async (event: AppSyncResolverEvent<any>) => {
    try {
        const resumeText = event.arguments?.resumeText;

        if (!resumeText) {
            throw new Error("Missing resumeText in arguments");
        }

        const prompt = createPrompt(resumeText);

        const input = {
            modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0", // Ensure this model is enabled in your AWS account
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        };

        const command = new InvokeModelCommand(input);
        const response = await bedRockClient.send(command);

        // Parse the response body
        const responseBody = new TextDecoder().decode(response.body);
        const result = JSON.parse(responseBody);

        // Extract the content from Claude's response structure
        let extractedJson = result.content[0].text;

        // Clean up any markdown code blocks if the model included them despite instructions
        extractedJson = extractedJson.replace(/```json\n?|\n?```/g, "").trim();

        // For AppSync, simply return the data. 
        // If the return type in schema is JSON, we can return the JSON string or object. 
        // Returning the raw string might be safer if the client expects to parse it. 
        // But usually best to return a string if type is JSON.
        return extractedJson;

    } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error(`Error parsing resume: ${(error as Error).message}`);
    }
};
