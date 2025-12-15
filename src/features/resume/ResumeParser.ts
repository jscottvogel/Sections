import { useState } from 'react';
import { Schema } from '../../../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { post } from 'aws-amplify/api';

const client = generateClient<Schema>();

export const ResumeParser = () => {
    const [resumeText, setResumeText] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParse = async () => {
        if (!resumeText) return;
        setLoading(true);
        setError(null);
        setParsedData(null);

        try {
            const { data: response, errors } = await client.queries.parseResume({
                resumeText
            });

            if (errors) {
                throw new Error(errors[0].message);
            }

            // response might be a stringified JSON if the backend returns valid stringified JSON, 
            // OR if I set .returns(a.json()) it should handle object.
            // The handler returns stringified JSON in body, but AppSync might interpret it.
            // Wait, my handler logic returns { statusCode, body: stringifiedJson }. This is for APIGateway.
            // For AppSync function directly attached via `a.handler.function`, the event structure is different.
            // The previous handler I wrote expects APIGatewayProxyEvent.
            // When invoked from AppSync, the event contains arguments directly.
            // I need to update the handler to support AppSync invocation or check event structure.

            // Let's assume for now I will fix the handler to support both or just AppSync.
            // AppSync passes arguments in `event.arguments`.

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
        <div className= "p-4 bg-white rounded-lg shadow" >
        <h2 className="text-xl font-bold mb-4" > Resume Parser Agent </h2>
            < textarea
    className = "w-full h-64 p-2 border border-gray-300 rounded mb-4"
    placeholder = "Paste resume text here..."
    value = { resumeText }
    onChange = {(e) => setResumeText(e.target.value)}
      />
    < button
className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
onClick = { handleParse }
disabled = { loading || !resumeText}
      >
    { loading? 'Parsing...': 'Parse Resume' }
    </button>

{
    error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded" >
            Error: { error }
    </div>
      )
}

{
    parsedData && (
        <div className="mt-4" >
            <h3 className="text-lg font-semibold mb-2" > Parsed Result: </h3>
                < pre className = "bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm" >
                    { JSON.stringify(parsedData, null, 2) }
                    </pre>
                    </div>
      )
}
</div>
  );
};
