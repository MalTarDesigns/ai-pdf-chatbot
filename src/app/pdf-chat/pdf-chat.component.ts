import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Component, OnInit } from '@angular/core';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import {
  BaseMessage,
  HumanMessage,
  AIMessage
} from '@langchain/core/messages';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { AuthService } from '../services/auth.service';
import { PdfChatBotService } from '../services/pdf-chat-bot.service';
import { switchMap, take } from 'rxjs';
import { OPENAI_API_KEY } from '../../environment';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-pdf-chat',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    RouterModule,
    MatGridListModule,
    ChatBotComponent,
    PdfViewerComponent,
  ],
  templateUrl: './pdf-chat.component.html',
  styleUrls: ['./pdf-chat.component.scss'],
})
export class PdfChatComponent implements OnInit {
  extractedDocs: any[] = [];
  embeddingsModel!: OpenAIEmbeddings;
  isLoading: boolean = true;
  pdfRoute: string = '';
  vectorStore!: MemoryVectorStore;
  languageModel!: ChatOpenAI;
  historyAwareRetriever: any;
  questionAnswerChain: any;
  qaChain: any;
  chat_history: BaseMessage[] = [];
  lastAnswerObj!: any; // TODO: Add type

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private pdfChatBotService: PdfChatBotService
  ) {}

  async ngOnInit() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    try {
      await this.getPdfDetailsAndExecute();
    } catch (error) {
      console.error('Error in PDF processing workflow:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async getPdfDetailsAndExecute(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.route.paramMap.pipe(
        take(1),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            return this.pdfChatBotService.getPdfDetail(+id);
          } else {
            throw new Error('No ID found in route parameters');
          }
        })
      ).subscribe({
        next: async pdfDetail => {
          this.pdfRoute = `/${pdfDetail.url}`;
          console.log('PDF Route:', this.pdfRoute);

          try {
            await this.loadPdf();
            // await this.splitDocuments(); // - Uncomment if needed
            await this.generateEmbeddings();
            await this.createVectorStore();
            await this.initializeLanguageModel();
            await this.createQAChain();
            resolve();
          } catch (error) {
            console.error('Error in PDF processing workflow:', error);
            reject(error);
          }
        },
        error: err => {
          console.error('Error fetching PDF details:', err);
          reject(err);
        }
      });
    });
  }

  async loadPdf() {
    const pdfPath = this.pdfRoute;
    const response = await fetch(pdfPath);
    const buffer = await response.arrayBuffer();
    const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
    const loader = new WebPDFLoader(pdfBlob, {
      pdfjs: () =>
        Promise.resolve({
          getDocument: pdfjsLib.getDocument,
          version: '',
        }),
    });
    const docs = await loader.load();
    console.log('Raw Documents:', docs);
    this.extractedDocs = docs;
  }

  async splitDocuments() {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(this.extractedDocs);
    console.log('Split Documents:', splitDocs);
    this.extractedDocs = splitDocs;
  }

  async generateEmbeddings() {
    this.embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002',
    });
  }

  async createVectorStore() {
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      this.extractedDocs,
      this.embeddingsModel
    );
    console.log('Vector store created with documents.');
  }

  async initializeLanguageModel() {
    this.languageModel = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      temperature: 0,
    });
  }

  async createQAChain() {
    const contextualizeQSystemPrompt = `
      Given the following PDF content, and the latest user question which might reference previous context in the chat history,
      reformulate the question to be standalone and grounded strictly within the provided PDF content.
      Do NOT answer the question, just reformulate it, and if no reformulation is needed, return it as is.`;


    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(contextualizeQSystemPrompt),
      new MessagesPlaceholder('chat_history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    this.historyAwareRetriever = await createHistoryAwareRetriever({
      llm: this.languageModel,
      retriever: this.vectorStore.asRetriever(),
      rephrasePrompt: contextualizeQPrompt,
    });

    const qaSystemPrompt = `
      You are an assistant that answers questions strictly based on the provided PDF content. Use ONLY the following pieces of retrieved PDF context to answer the question.
      If the answer is not found in the PDF, respond by saying "The answer is not available in the provided PDF."
      Do not generate any information beyond what is provided in the PDF content.

      {context}`;

    const qaPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(qaSystemPrompt),
      new MessagesPlaceholder('chat_history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    this.questionAnswerChain = await createStuffDocumentsChain({
      llm: this.languageModel,
      prompt: qaPrompt,
    });

    this.qaChain = await createRetrievalChain({
      retriever: this.historyAwareRetriever,
      combineDocsChain: this.questionAnswerChain,
    });
  }

  async askQuestion(question: string) {
    if (!question) return;

    try {
      const response = await this.qaChain.invoke({
        chat_history: this.chat_history,
        input: question,
      });

      const answer = response['text'] || response || 'Sorry, I could not generate a response.';

      this.lastAnswerObj = answer;

      // Update chat history
      this.chat_history.push(new HumanMessage(question));
      this.chat_history.push(new AIMessage({content: answer.answer}));
    } catch (error) {
      console.error('Error getting answer from QA chain:', error);
    }
  }

  /**
   * Handles the emitted user query from the ChatBotComponent.
   */
  handleUserQuery(query: string) {
    this.askQuestion(query);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
