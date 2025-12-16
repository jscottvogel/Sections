export const createPrompt = (resumeText?: string) => `
You are an expert Resume Parsing AI. Your job is to extract data from the attached resume document (PDF/Image) or the text provided below, and STRUCTURE IT EXACTLY according to the following JSON schema.

${resumeText ? `Resume Text:\n${resumeText}` : ''}

REQUIRED JSON STRUCTURE:
{
  "contact_info": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "summary": {
    "heading": "string",
    "summary": "string"
  },
  "work_experience": [
    {
      "role": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or 'Present'",
      "isCurrent": boolean,
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "graduationDate": "YYYY-MM-DD",
      "details": "string"
    }
  ],
  "skills": [
    {
      "category": "string (e.g. Languages, Frameworks)",
      "items": "comma separated string (e.g. Python, React, AWS)"
    }
  ],
  "projects": [
    {
      "title": "string",
      "link": "string",
      "description": "string",
      "technologies": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM-DD",
      "expirationDate": "YYYY-MM-DD",
      "url": "string"
    }
  ],
  "volunteer": [
    {
      "role": "string",
      "organization": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "string"
    }
  ],
  "custom_sections": [
    {
       "heading": "string (e.g. Publications, Awards, Languages)",
       "items": [
         {
           "title": "string",
           "description": "string",
           "date": "string (optional)"
         }
       ]
    }
  ]
}

- If a field is missing, use null or empty string.
- Dates should be YYYY-MM-DD. If only year is known, use YYYY-01-01.
- Return ONLY the raw JSON object. No markdown.
`;
