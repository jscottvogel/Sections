import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { parseResume } from './functions/parseResume/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  parseResume,
});

// 1. Grant Bedrock access to the Lambda
backend.parseResume.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['bedrock:InvokeModel'],
  resources: ['arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0'],
}));

// 2. Grant Authenticated Users access to invoke the Lambda directly (bypassing AppSync)
const authenticatedUserRole = backend.auth.resources.authenticatedUserIamRole;
backend.parseResume.resources.lambda.grantInvoke(authenticatedUserRole);

// 3. Output the function name so the frontend can call it
backend.addOutput({
  custom: {
    parseResumeFunctionName: backend.parseResume.resources.lambda.functionName,
  },
});

export default backend;
