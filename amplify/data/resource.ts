import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Resume: a.model({
    title: a.string(),
    description: a.string(),
    sections: a.hasMany('Section', 'resumeId'),
    isMain: a.boolean(),
  }).authorization(allow => [allow.owner()]),

  Section: a.model({
    title: a.string().required(),
    type: a.string(), // e.g. "Work Experience", "Education"
    content: a.json(), // Flexible JSON content
    order: a.integer(),
    resumeId: a.id(),
    resume: a.belongsTo('Resume', 'resumeId'),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
