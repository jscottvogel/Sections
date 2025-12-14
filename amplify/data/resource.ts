import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  KnowledgeBase: a.model({
    title: a.string().default('My Knowledge Base'),
    description: a.string(),
    metadata: a.json(), // Stores profile, document, sources, etc.
    sections: a.hasMany('Section', 'knowledgeBaseId'),
  }).authorization(allow => [allow.owner()]),

  Section: a.model({
    knowledgeBaseId: a.id().required(),
    knowledgeBase: a.belongsTo('KnowledgeBase', 'knowledgeBaseId'),
    type: a.string().required(), // e.g. "education", "experience"
    title: a.string().required(), // User facing title
    content: a.json(), // Structured data based on type
    order: a.integer(),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
