# Architecture Overview

## System Design

The AI PDF Chatbot is built as a client-side Angular application that processes PDF documents and enables natural language conversations about their content using OpenAI's language models.

## Core Components

### Frontend Architecture

```
src/app/
├── services/           # Business logic and API integration
│   ├── auth.service.ts         # Authentication management
│   ├── auth.guard.ts           # Route protection
│   ├── pdf-chat-bot.service.ts # PDF data management
│   └── pdf-chat-bot.models.ts  # TypeScript models
├── pdf-chat/          # Main chatbot feature
│   ├── pdf-viewer/    # PDF display component
│   └── chat-bot/      # Conversation interface
├── login/             # Authentication UI
├── header/            # Navigation component
└── pdf-table/         # PDF listing component
```

### Data Flow

1. **PDF Loading**: Documents are loaded using WebPDFLoader from LangChain
2. **Text Extraction**: PDF content is parsed and split into chunks
3. **Embeddings**: OpenAI's text-embedding-ada-002 creates vector representations
4. **Vector Storage**: MemoryVectorStore handles similarity search
5. **Chat Chain**: Contextual conversation using history-aware retrieval

## Technical Decisions

### Why LangChain?
- Handles complex RAG (Retrieval-Augmented Generation) workflows
- Built-in document processing and vector store integration
- Conversation history management

### Why Client-Side Processing?
- No backend infrastructure required
- Direct PDF processing in browser
- Keeps sensitive documents local

### Memory Vector Store
- Suitable for demo/portfolio purposes
- Documents processed per session
- Could be upgraded to persistent storage (Pinecone, etc.)

## Security Considerations

- API keys managed through environment configuration
- Client-side processing keeps documents private
- Authentication guard protects routes
- Input validation on chat queries

## Performance Optimizations

- Document chunking with overlap for better context retrieval
- Lazy loading of PDF processing components
- Efficient vector similarity search
- Conversation context management

## Future Improvements

- Persistent vector storage for document library
- Backend API for scalability
- Multiple document format support
- Advanced conversation analytics