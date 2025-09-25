// Example configuration file for local development
// Copy this file to environment-local.ts and add your actual API keys
// Never commit environment-local.ts with actual API keys

export const OPENAI_API_KEY = process.env['OPENAI_API_KEY'] || 'YOUR_OPENAI_API_KEY_HERE'

// Optional: Future API integrations
export const PINECONE_API_KEY = process.env['PINECONE_API_KEY'] || 'YOUR_PINECONE_API_KEY_HERE'
export const PINECONE_ENV_NAME = process.env['PINECONE_ENV_NAME'] || ''
export const PINECONE_INDEX_NAME = process.env['PINECONE_INDEX_NAME'] || 'pdf-reader'
export const PINECONE_ENVIRONMENT = process.env['PINECONE_ENVIRONMENT'] || 'us-east-1'