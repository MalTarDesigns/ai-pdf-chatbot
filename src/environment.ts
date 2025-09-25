// Environment configuration
// For local development, actual values are loaded from environment-local.ts

// Try to load from local config first, fall back to defaults
let localConfig: any = {};
try {
  localConfig = require('../environment-local');
} catch {
  // environment-local.ts doesn't exist, use defaults
}

// Export configuration with local overrides
export const OPENAI_API_KEY = localConfig.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

// Optional future integrations
export const PINECONE_API_KEY = localConfig.PINECONE_API_KEY || 'YOUR_PINECONE_API_KEY_HERE';
export const PINECONE_ENV_NAME = localConfig.PINECONE_ENV_NAME || '';
export const PINECONE_INDEX_NAME = localConfig.PINECONE_INDEX_NAME || 'pdf-reader';
export const PINECONE_ENVIRONMENT = localConfig.PINECONE_ENVIRONMENT || 'us-east-1';
