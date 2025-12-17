import type { ResumeDocument, ResumeSection } from "../../../types";
import * as mammoth from 'mammoth';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from "aws-amplify/auth";
import outputs from "../../../../amplify_outputs.json";

/**
 * Service to handle document parsing using the AI Agent.
 */
export class DocumentParser {
    static async parse(file: File): Promise<ResumeDocument> {
        let resumeText: string | undefined;
        let encodedFile: string | undefined;
        let contentType: string | undefined;

        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            // Handle DOCX -> Extract Text
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const result = await mammoth.extractRawText({ arrayBuffer });
            resumeText = result.value;
        } else if (file.type === 'text/plain') {
            // Handle Text File
            resumeText = await this.fileToText(file);
        } else {
            // Handle PDF (and others supported by Bedrock) -> Base64
            encodedFile = await this.fileToBase64(file);
            contentType = file.type;
        }

        // 2. Call backend Lambda directly (Bypassing AppSync 30s timeout)
        const session = await fetchAuthSession();
        if (!session.credentials) {
            throw new Error("User must be authenticated to parse resume.");
        }

        const functionName = (outputs as any).custom?.parseResumeFunctionName;
        if (!functionName) {
            throw new Error("Parse Resume function name not found. Please deploy the backend updates.");
        }

        const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials
        });

        // Construct event that matches AppSync resolver structure so we don't need to change handler logic
        const payload = {
            arguments: {
                resumeText,
                encodedFile,
                contentType
            }
        };

        const command = new InvokeCommand({
            FunctionName: functionName,
            Payload: new TextEncoder().encode(JSON.stringify(payload))
        });

        let parsedJson;
        let rawResponse = "No raw response captured";

        try {
            const response = await lambdaClient.send(command);

            if (response.FunctionError) {
                throw new Error(`Lambda execution failed: ${response.FunctionError}`);
            }

            // Decode payload
            if (response.Payload) {
                const resultString = new TextDecoder().decode(response.Payload);
                // Handler returns a JSON string, so we need to parse it once to get the string, and again to get the object?
                // Handler: return JSON.stringify({ ... })
                // ResultString: "{\"rawResponse\":...}"

                let wrapper: any = JSON.parse(resultString);
                if (typeof wrapper === 'string') wrapper = JSON.parse(wrapper);

                if (wrapper && typeof wrapper === 'object' && wrapper.cleanedJson) {
                    rawResponse = wrapper.rawResponse;
                    parsedJson = JSON.parse(wrapper.cleanedJson);
                } else {
                    parsedJson = wrapper;
                }
            } else {
                throw new Error("Empty response from Lambda");
            }

        } catch (e: any) {
            console.error("Lambda Invocation Error:", e);
            // Handle timeout specifically if SDK throws it (though default is high, network might fail)
            throw new Error("Resume analysis failed: " + e.message);
        }

        // Inject raw response into debug notes if missing
        if (!parsedJson._debug_notes) {
            parsedJson._debug_notes = "Raw Output: " + (rawResponse ? rawResponse.substring(0, 500) : "None");
        }

        // 3. Map to ResumeDocument structure
        return this.mapToResumeDocument(parsedJson, file);
    }

    private static fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = error => reject(error);
        });
    }

    private static fileToText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    private static fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    private static mapToResumeDocument(data: any, file: File): ResumeDocument {
        const sections: ResumeSection[] = [];
        let sectionCounter = 0;

        // Helper to add section
        const addSection = (type: string, label: string, items: any[]) => {
            if (items && items.length > 0) {
                sections.push({
                    id: `sec-${Date.now()}-${sectionCounter++}`,
                    type,
                    label,
                    order: sectionCounter,
                    items
                });
            }
        };

        // Map specific array fields to sections
        addSection('experience', 'Work Experience', data.work_experience);
        addSection('education', 'Education', data.education);
        addSection('skills', 'Skills', data.skills);
        addSection('projects', 'Projects', data.projects);
        addSection('certifications', 'Certifications', data.certifications);
        addSection('volunteer', 'Volunteer', data.volunteer);

        // Map custom sections
        if (data.custom_sections && Array.isArray(data.custom_sections)) {
            data.custom_sections.forEach((cs: any) => {
                const heading = cs.heading || 'Custom Section';
                // Sanitize type key to be alphanumeric only
                const typeKey = heading.toLowerCase().replace(/[^a-z0-9]/g, '');
                addSection(typeKey || 'custom', heading, cs.items);
            });
        }

        return {
            schema_version: "1.0.0",
            document: {
                resume_id: crypto.randomUUID(),
                language: "en",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                source: {
                    type: file.type,
                    filename: file.name,
                    page_count: 0
                },
                parse_meta: {
                    parser: "bedrock-claude-3.5-sonnet",
                    model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
                    _debug_notes: data._debug_notes || "No notes provided"
                }
            },
            profile: {
                name: {
                    full: data.contact_info?.fullName || "Unknown Name",
                    // Simple split for first/last if needed, or leave optional
                },
                headline: data.summary?.heading,
                summary: data.summary?.summary,
                location: {
                    // parsing "City, State" string is complex, leaving explicit fields empty or putting full string in one if schema allowed. 
                    // Schema has city, region, country.
                    // We'll put the raw string in city if we have to, or leave blank.
                    // prompt returns "location" string.
                    city: data.contact_info?.location
                },
                contacts: {
                    email: data.contact_info?.email,
                    phone: data.contact_info?.phone,
                    linkedin: data.contact_info?.linkedin,
                    other_links: data.contact_info?.portfolio ? [{ label: "Portfolio", url: data.contact_info.portfolio }] : []
                }
            },
            sections
        };
    }
}
