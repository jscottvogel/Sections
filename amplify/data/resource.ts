import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Resume: a.model({
    title: a.string(),
    description: a.string(),
    // We will store the structure/order of sections here in JSON, or as a connection to a specific ResumeSection join table later.
    // For now, let's keep it simple: Resumes are snapshots or lists of section IDs.
    sectionIds: a.string().array(),
  }).authorization(allow => [allow.owner()]),

  Section: a.model({
    category: a.string().required(), // e.g. "Experience", "Education", "Skills"
    title: a.string().required(), // Friendly name for the user
    content: a.json(), // The data fields
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
