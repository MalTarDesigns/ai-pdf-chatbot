import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PdfChatComponent } from './pdf-chat.component';
import { PdfChatBotService } from '../services/pdf-chat-bot.service';
import { AuthService } from '../services/auth.service';

// Mock for LangChain modules
jest.mock('@langchain/community/document_loaders/web/pdf', () => ({
  WebPDFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue([
      { pageContent: 'Sample PDF content', metadata: { source: 'test.pdf', loc: { pageNumber: 1 } } }
    ])
  }))
}));

jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn(),
  ChatOpenAI: jest.fn()
}));

jest.mock('langchain/vectorstores/memory', () => ({
  MemoryVectorStore: {
    fromDocuments: jest.fn().mockResolvedValue({
      asRetriever: jest.fn().mockReturnValue({})
    })
  }
}));

describe('PdfChatComponent - Improved Integration Tests', () => {
  let component: PdfChatComponent;
  let fixture: ComponentFixture<PdfChatComponent>;
  let mockPdfChatBotService: jasmine.SpyObj<PdfChatBotService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const pdfServiceSpy = jasmine.createSpyObj('PdfChatBotService', ['getPdfDetail']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      paramMap: of(new Map([['id', '1']]))
    };

    await TestBed.configureTestingModule({
      imports: [
        PdfChatComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PdfChatBotService, useValue: pdfServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfChatComponent);
    component = fixture.componentInstance;

    mockPdfChatBotService = TestBed.inject(PdfChatBotService) as jasmine.SpyObj<PdfChatBotService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component properties', () => {
      expect(component.extractedDocs).toEqual([]);
      expect(component.isLoading).toBe(true);
      expect(component.chat_history).toEqual([]);
    });

    it('should set PDF.js worker source', async () => {
      // Mock global pdfjsLib
      (global as any).pdfjsLib = {
        GlobalWorkerOptions: { workerSrc: '' },
        version: '3.5.141'
      };

      mockPdfChatBotService.getPdfDetail.and.returnValue(of({
        id: 1,
        title: 'Test PDF',
        url: 'test.pdf',
        metadata: { pages: 10 }
      }));

      // Mock fetch for PDF loading
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      }) as jest.Mock;

      component.ngOnInit();

      expect((global as any).pdfjsLib.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.min.js');
    });

    it('should handle initialization errors gracefully', async () => {
      mockPdfChatBotService.getPdfDetail.and.returnValue(throwError('Service error'));
      spyOn(console, 'error');

      await component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error in PDF processing workflow:', 'Service error');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getPdfDetailsAndExecute', () => {
    it('should fetch PDF details and process successfully', (done) => {
      const mockPdfDetail = {
        id: 1,
        title: 'Test PDF',
        url: 'test.pdf',
        metadata: { pages: 10 }
      };

      mockPdfChatBotService.getPdfDetail.and.returnValue(of(mockPdfDetail));

      // Mock all the async methods
      spyOn(component, 'loadPdf').and.returnValue(Promise.resolve());
      spyOn(component, 'generateEmbeddings').and.returnValue(Promise.resolve());
      spyOn(component, 'createVectorStore').and.returnValue(Promise.resolve());
      spyOn(component, 'initializeLanguageModel').and.returnValue(Promise.resolve());
      spyOn(component, 'createQAChain').and.returnValue(Promise.resolve());

      component.getPdfDetailsAndExecute().then(() => {
        expect(component.pdfRoute).toBe('/test.pdf');
        expect(component.loadPdf).toHaveBeenCalled();
        expect(component.generateEmbeddings).toHaveBeenCalled();
        expect(component.createVectorStore).toHaveBeenCalled();
        expect(component.initializeLanguageModel).toHaveBeenCalled();
        expect(component.createQAChain).toHaveBeenCalled();
        done();
      });
    });

    it('should handle PDF processing errors', (done) => {
      mockPdfChatBotService.getPdfDetail.and.returnValue(throwError('PDF not found'));
      spyOn(console, 'error');

      component.getPdfDetailsAndExecute().catch((error) => {
        expect(console.error).toHaveBeenCalled();
        expect(error).toBe('PDF not found');
        done();
      });
    });

    it('should handle missing route ID parameter', (done) => {
      mockActivatedRoute.paramMap = of(new Map());

      component.getPdfDetailsAndExecute().catch((error) => {
        expect(error.message).toBe('No ID found in route parameters');
        done();
      });
    });
  });

  describe('askQuestion', () => {
    beforeEach(() => {
      component.qaChain = {
        invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve({
          answer: 'Test answer from QA chain'
        }))
      };
    });

    it('should process question and update chat history', async () => {
      const question = 'What is this document about?';

      await component.askQuestion(question);

      expect(component.qaChain.invoke).toHaveBeenCalledWith({
        chat_history: component.chat_history,
        input: question
      });

      expect(component.chat_history.length).toBe(2); // Human question + AI response
      expect(component.lastAnswerObj).toBe('Test answer from QA chain');
    });

    it('should handle empty questions', async () => {
      await component.askQuestion('');

      expect(component.qaChain.invoke).not.toHaveBeenCalled();
    });

    it('should handle QA chain errors', async () => {
      component.qaChain.invoke = jasmine.createSpy('invoke').and.returnValue(
        Promise.reject(new Error('QA chain error'))
      );
      spyOn(console, 'error');

      await component.askQuestion('test question');

      expect(console.error).toHaveBeenCalledWith('Error getting answer from QA chain:', jasmine.any(Error));
    });

    it('should handle different response formats', async () => {
      // Test text response format
      component.qaChain.invoke = jasmine.createSpy('invoke').and.returnValue(
        Promise.resolve({ text: 'Text response format' })
      );

      await component.askQuestion('test');
      expect(component.lastAnswerObj).toBe('Text response format');

      // Test direct string response
      component.qaChain.invoke = jasmine.createSpy('invoke').and.returnValue(
        Promise.resolve('Direct string response')
      );

      await component.askQuestion('test2');
      expect(component.lastAnswerObj).toBe('Direct string response');

      // Test fallback response
      component.qaChain.invoke = jasmine.createSpy('invoke').and.returnValue(
        Promise.resolve(null)
      );

      await component.askQuestion('test3');
      expect(component.lastAnswerObj).toBe('Sorry, I could not generate a response.');
    });
  });

  describe('handleUserQuery', () => {
    it('should call askQuestion with the provided query', () => {
      spyOn(component, 'askQuestion');
      const testQuery = 'Test user query';

      component.handleUserQuery(testQuery);

      expect(component.askQuestion).toHaveBeenCalledWith(testQuery);
    });
  });

  describe('logout', () => {
    it('should call auth service logout and navigate to login', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('PDF loading workflow', () => {
    it('should complete full PDF processing workflow', async () => {
      const mockPdfDetail = {
        id: 1,
        title: 'Test PDF',
        url: 'test.pdf',
        metadata: { pages: 10 }
      };

      mockPdfChatBotService.getPdfDetail.and.returnValue(of(mockPdfDetail));

      // Mock fetch for PDF loading
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      }) as jest.Mock;

      // Mock Blob constructor
      global.Blob = jest.fn().mockImplementation(() => ({})) as any;

      await component.getPdfDetailsAndExecute();

      expect(component.pdfRoute).toBe('/test.pdf');
    });
  });

  describe('error boundary tests', () => {
    it('should handle component destruction gracefully', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should handle undefined qaChain gracefully', async () => {
      component.qaChain = undefined;

      await component.askQuestion('test question');
      // Should not throw error
    });

    it('should handle malformed AI responses', async () => {
      component.qaChain = {
        invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve({
          // Missing expected properties
          unexpectedProperty: 'value'
        }))
      };

      await component.askQuestion('test');

      expect(component.lastAnswerObj).toBe('Sorry, I could not generate a response.');
    });
  });

  describe('memory management', () => {
    it('should maintain reasonable chat history size', async () => {
      component.qaChain = {
        invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve({
          answer: 'Response'
        }))
      };

      // Ask many questions to test memory usage
      for (let i = 0; i < 50; i++) {
        await component.askQuestion(`Question ${i}`);
      }

      expect(component.chat_history.length).toBe(100); // 50 questions + 50 answers
    });
  });

  describe('component lifecycle', () => {
    it('should handle component initialization with missing dependencies', () => {
      const testComponent = new PdfChatComponent(
        null as any,
        null as any,
        null as any,
        null as any
      );

      expect(testComponent).toBeTruthy();
      expect(testComponent.extractedDocs).toEqual([]);
      expect(testComponent.isLoading).toBe(true);
    });
  });
});