import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

// This file is imported for its side effects (Amplify configuration).
// It must be imported before any other file that uses Amplify.
Amplify.configure(outputs);
