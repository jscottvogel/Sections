// AppSync passes arguments in event.arguments
import type { AppSyncResolverEvent } from "aws-lambda";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedRockClient = new BedrockRuntimeClient({ region: "us-east-1" });

import { createPrompt } from './prompt';

export const handler = async (event: AppSyncResolverEvent<any>) => {
    try {
        const { resumeText, encodedFile, contentType } = event.arguments || {};

        if (!resumeText && !encodedFile) {
            throw new Error("Missing resumeText or encodedFile in arguments");
        }

        const messages: any[] = [];

        // If file is provided, add document block
        if (encodedFile) {
            if (!contentType) {
                throw new Error("Missing contentType for encodedFile");
            }
            messages.push({
                role: "user",
                content: [
                    {
                        type: "document",
                        source: {
                            type: "base64",
                            media_type: contentType,
                            data: encodedFile
                        }
                    },
                    {
                        type: "text",
                        text: createPrompt() // Instructions only
                    }
                ]
            });
            console.log(messages);
        } else {
            // Text only logic
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: createPrompt(resumeText) // Instructions + embedded text
                    }
                ]
            });
            console.log(messages);
        }


        const input = {
            modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 4096,
                messages: messages,
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

        return extractedJson;

    } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error(`Error parsing resume: ${(error as Error).message}`);
    }
};
