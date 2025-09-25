# Environment Setup

## API Keys Configuration

This project requires an OpenAI API key for document processing and chat functionality. Follow these steps to configure it:

### Method 1: Using TypeScript configuration files (Recommended for local development)

1. Copy `environment-local-example.ts` to `environment-local.ts`:
   ```bash
   cp environment-local-example.ts environment-local.ts
   ```

2. Edit `environment-local.ts` and replace the placeholder with your actual API key:
   ```typescript
   export const OPENAI_API_KEY = 'sk-your-actual-openai-api-key-here'
   ```

### Method 2: Using environment variables (For production/deployment)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

## Security Notes

- **NEVER** commit files containing actual API keys to version control
- Both `environment-local.ts` and `.env` files are already in `.gitignore`
- Always use placeholder values in committed configuration files
- Rotate your API keys immediately if they are accidentally exposed

## Getting API Keys

### OpenAI API Key

1. Sign up or log in at https://platform.openai.com
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the key (it starts with `sk-`)

**Important**: You'll need billing enabled on your OpenAI account to use the API.

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Angular CLI**: Install globally with `npm install -g @angular/cli`

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ai-pdf-chatbot.git
   cd ai-pdf-chatbot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API key** (choose one method from above)

4. **Start development server**:
   ```bash
   npm start
   ```

5. **Open your browser** to `http://localhost:4000`

## Verification

To verify everything is working correctly:

1. The app should load without console errors
2. You should see the login page
3. After logging in, you should see the PDF list
4. Selecting a PDF should load it and enable the chat interface

If you see a warning about missing API key in the browser console, double-check your configuration file.

## Troubleshooting

### Common Issues

**"API key not configured" warning**:
- Make sure you copied the example file and added your actual API key
- Restart the development server after making changes

**"Failed to load PDF"**:
- Check that the PDF files exist in the `public/` directory
- Verify the browser console for specific error messages

**Build errors related to environment**:
- Ensure you have the correct Node.js version (18+)
- Try deleting `node_modules` and running `npm install` again

**OpenAI API errors**:
- Verify your API key is correct and has billing enabled
- Check the OpenAI platform status page

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all prerequisites are installed
3. Review the configuration files for typos
4. Open an issue with details about the error and your setup

## Environment Variables Reference

- `OPENAI_API_KEY`: Your OpenAI API key for GPT models and embeddings
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Development server port (default: 4000)

## Optional: Future Integrations

The project includes configuration placeholders for:
- `PINECONE_API_KEY`: For persistent vector storage
- `PINECONE_INDEX_NAME`: Pinecone index configuration
- `PINECONE_ENVIRONMENT`: Pinecone region settings

These are commented out in the example files as they're not currently used.