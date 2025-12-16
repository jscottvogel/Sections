import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

import { parseResume } from '../functions/parseResume/resource';

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

  parseResume: a
    .query()
    .arguments({
      resumeText: a.string(),
      encodedFile: a.string(),
      contentType: a.string()
    })
    .returns(a.json())
    .handler(a.handler.function(parseResume))
    .authorization(allow => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
