# API Documentation

## Service APIs

### PdfChatBotService

Main service for managing PDF document data and interactions.

#### Methods

**`getPdfList(): Observable<pdfListResponse[]>`**
- Returns list of available PDF documents
- Currently uses mock data
- Future: Can be connected to backend API

```typescript
interface pdfListResponse {
  id: number;
  title: string;
  description: string;
}
```

**`getPdfDetail(id: number): Observable<pdfDetailResponse>`**
- Gets specific PDF document details
- Returns PDF file path for loading
- Throws error for invalid IDs

```typescript
interface pdfDetailResponse {
  url: string;
}
```

### AuthService

Handles user authentication and session management.

#### Methods

**`login(credentials): Observable<any>`**
- Authenticates user (currently mock implementation)
- Returns authentication token/status

**`logout(): void`**
- Clears user session
- Redirects to login page

**`isAuthenticated(): boolean`**
- Checks current authentication status

### AuthGuard

Route protection service that implements `CanActivate`.

- Protects PDF chat routes from unauthorized access
- Redirects unauthenticated users to login page

## External APIs

### OpenAI Integration

The application integrates with OpenAI's API for:

**Language Model**: GPT-3.5-turbo
- Used for generating responses to user questions
- Context-aware conversation handling
- Configured with temperature=0 for consistent responses

**Embeddings**: text-embedding-ada-002
- Converts document chunks to vector representations
- Enables semantic similarity search
- Vector dimension: 1536

### LangChain Components

**WebPDFLoader**
- Loads and parses PDF documents in browser
- Extracts text content for processing

**RecursiveCharacterTextSplitter**
- Splits documents into manageable chunks
- Default: 500 characters with 100 character overlap
- Preserves context across chunk boundaries

**MemoryVectorStore**
- In-memory vector database
- Performs similarity search for relevant document sections
- Creates retrieval chain for question answering

## Configuration

### Environment Variables

```typescript
// src/environment.ts
export const OPENAI_API_KEY: string;
export const environment: {
  production: boolean;
  openai: {
    apiKey: string;
    model: string;
    embeddingModel: string;
  };
  api: {
    baseUrl: string;
  };
};
```

### Mock Data Structure

Located in `src/app/mock-data.ts`:

- Sample PDF documents for development/demo
- Configurable document titles and descriptions
- File path references for PDF loading