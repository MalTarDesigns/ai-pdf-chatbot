# AI PDF Chatbot

A web application that lets you upload PDFs and chat with their content using AI. Built with Angular and powered by OpenAI's language models through LangChain.

## What it does

Upload any PDF document and ask questions about its content. The app processes the PDF, breaks it into chunks, creates embeddings, and uses retrieval-augmented generation (RAG) to give you accurate answers based on the document content.

## Tech stack

- **Frontend**: Angular 18, Angular Material, TypeScript
- **PDF Processing**: PDF.js, LangChain document loaders
- **AI/ML**: OpenAI GPT models via LangChain, vector embeddings
- **State Management**: RxJS observables
- **Authentication**: Simple JWT-style auth guard
- **Testing**: Jasmine, Karma

## Getting started

### Prerequisites

- Node.js (v18 or higher)
- Angular CLI (`npm install -g @angular/cli`)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/MalTarDesigns/ai-pdf-chatbot.git
cd ai-pdf-chatbot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy the example file
cp environment-local-example.ts environment-local.ts

# Edit environment-local.ts and add your OpenAI API key
export const OPENAI_API_KEY = "your-openai-api-key-here"
```

4. Run the application
```bash
npm start
```

The app will be available at `http://localhost:4000`.

### Default login
- Username: `admin`
- Password: `admin`

## How it works

1. **Authentication**: Simple login screen with hardcoded credentials (demo purposes)
2. **PDF Upload**: Drag and drop or select PDF files
3. **Document Processing**:
   - Extracts text using PDF.js
   - Splits content into chunks with LangChain text splitters
   - Creates vector embeddings using OpenAI
   - Stores embeddings in memory vector store
4. **Chat Interface**:
   - Send questions about the PDF content
   - RAG pipeline retrieves relevant chunks
   - OpenAI generates contextual responses
   - Maintains conversation history

## Project structure

```
src/app/
├── header/              # Navigation header component
├── login/               # Authentication page
├── pdf-chat/           # Main PDF processing and chat
│   ├── chat-bot/       # Chat interface component
│   └── pdf-viewer/     # PDF display component
├── pdf-table/          # PDF list/management
└── services/           # Business logic
    ├── auth.service.ts
    └── pdf-chat-bot.service.ts
```

## Challenges I solved

**PDF text extraction**: Getting clean, properly formatted text from PDFs was tricky. PDF.js works well but required careful handling of text layout and formatting.

**Chunking strategy**: Finding the right balance for text chunk sizes. Too small and you lose context, too large and retrieval becomes less precise. Settled on recursive character splitting with 1000 character chunks and 200 character overlap.

**Vector search accuracy**: Initial retrieval wasn't great. Improved by experimenting with different embedding models and adjusting the similarity search parameters.

**Chat memory**: Maintaining conversation context while keeping API costs reasonable. Implemented a sliding window approach that keeps recent conversation history.

**Angular integration**: LangChain is primarily Node.js focused, so adapting it for browser use with Angular required some workarounds, especially for the document loaders.

## What I learned

- **RAG architecture**: How to build a proper retrieval-augmented generation pipeline
- **Vector embeddings**: The importance of good chunking strategies and embedding quality
- **LangChain ecosystem**: Working with chains, retrievers, and prompt templates
- **PDF processing**: The complexities of extracting usable text from various PDF formats
- **Angular performance**: Managing heavy AI operations without blocking the UI

## Future improvements

- **Better chunking**: Implement semantic chunking that respects paragraph and section boundaries
- **Multiple file support**: Allow users to upload multiple PDFs and search across them
- **Conversation persistence**: Save chat history to local storage or a backend
- **Better auth**: Replace hardcoded credentials with proper user management
- **Streaming responses**: Stream AI responses for better user experience
- **PDF annotations**: Let users highlight relevant sections found during chat
- **Advanced search**: Add filters, date ranges, and metadata-based search
- **Export functionality**: Allow users to export conversations or summaries

## Development

### Running tests
```bash
npm test
```

### Building for production
```bash
npm run build
```

### Code quality
The project uses Angular's built-in linting. Run `ng lint` to check code style.

## Notes

This is a learning project focused on understanding RAG architecture and AI-powered document search. The authentication is intentionally simple for demo purposes.

The app currently stores all data in memory, so refreshing the page will clear uploaded documents and chat history.