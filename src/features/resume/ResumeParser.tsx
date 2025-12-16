import { useState } from 'react';
import type { Schema } from '../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

import * as mammoth from 'mammoth';

const client = generateClient<Schema>();

export const ResumeParser = () => {
    // ... state ...
    const [mode, setMode] = useState<'text' | 'file'>('file');
    const [resumeText, setResumeText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove "data:application/pdf;base64," prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const convertToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = error => reject(error);
        });
    };

    const convertToString = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleParse = async () => {
        if (mode === 'text' && !resumeText) return;
        if (mode === 'file' && !file) return;

        setLoading(true);
        setError(null);
        setParsedData(null);

        try {
            let encodedFile: string | undefined;
            let contentType: string | undefined;
            let extractedText: string | undefined;

            if (mode === 'file' && file) {
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                    const arrayBuffer = await convertToArrayBuffer(file);
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    extractedText = result.value;
                } else if (file.type === 'text/plain') {
                    extractedText = await convertToString(file);
                } else {
                    encodedFile = await convertToBase64(file);
                    contentType = file.type;
                }
            }

            const { data: response, errors } = await client.queries.parseResume({
                resumeText: mode === 'text' ? resumeText : extractedText,
                encodedFile,
                contentType
            });

            if (errors) {
                throw new Error(errors[0].message);
            }

            const parsed = typeof response === 'string' ? JSON.parse(response) : response;
            setParsedData(parsed);
        } catch (err) {
            console.error('Error parsing resume:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Resume Parser Agent</h2>

            <div className="mb-4 flex space-x-4">
                <button
                    className={`px-4 py-2 rounded ${mode === 'file' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100'}`}
                    onClick={() => setMode('file')}
                >
                    Upload File
                </button>
                <button
                    className={`px-4 py-2 rounded ${mode === 'text' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100'}`}
                    onClick={() => setMode('text')}
                >
                    Paste Text
                </button>
            </div>

            {mode === 'text' ? (
                <textarea
                    className="w-full h-64 p-2 border border-gray-300 rounded mb-4"
                    placeholder="Paste resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                />
            ) : (
                <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-gray-50">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="mb-4"
                    />
                    <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, TXT</p>
                </div>
            )}

            <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
                onClick={handleParse}
                disabled={loading || (mode === 'text' ? !resumeText : !file)}
            >
                {loading ? 'Parsing...' : 'Parse Resume'}
            </button>

            {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            {parsedData && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Parsed Result:</h3>
                    <div className="bg-gray-100 p-4 rounded overflow-auto max-h-screen text-sm">
                        <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};
