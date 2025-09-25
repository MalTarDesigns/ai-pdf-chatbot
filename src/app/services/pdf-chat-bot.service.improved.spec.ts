import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { PdfChatBotService } from './pdf-chat-bot.service';
import { pdfDetailResponse, pdfListResponse } from './pdf-chat-bot.models';

describe('PdfChatBotService - Improved Tests', () => {
  let service: PdfChatBotService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PdfChatBotService]
    });
    service = TestBed.inject(PdfChatBotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no unmatched HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPdfList', () => {
    it('should return mock PDF list', (done) => {
      service.getPdfList().subscribe(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Verify structure of first item
        if (result.length > 0) {
          expect(result[0]).toHaveProperty('id');
          expect(result[0]).toHaveProperty('title');
          expect(result[0]).toHaveProperty('description');
          expect(result[0]).toHaveProperty('tags');
          expect(result[0]).toHaveProperty('uploadDate');
          expect(result[0]).toHaveProperty('fileSize');
        }
        done();
      });
    });

    it('should return observable that emits immediately', () => {
      let emitted = false;
      service.getPdfList().subscribe(() => {
        emitted = true;
      });
      expect(emitted).toBe(true);
    });

    it('should return consistent data across multiple calls', () => {
      let firstResult: pdfListResponse[];
      let secondResult: pdfListResponse[];

      service.getPdfList().subscribe(result => {
        firstResult = result;
      });

      service.getPdfList().subscribe(result => {
        secondResult = result;
      });

      expect(firstResult!).toEqual(secondResult!);
    });
  });

  describe('getPdfDetail', () => {
    it('should return PDF detail for ID 1', (done) => {
      service.getPdfDetail(1).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(1);
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('metadata');

        // Verify metadata structure
        expect(result.metadata).toHaveProperty('pages');
        expect(typeof result.metadata.pages).toBe('number');
        done();
      });
    });

    it('should return PDF detail for ID 2', (done) => {
      service.getPdfDetail(2).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(2);
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('url');
        done();
      });
    });

    it('should throw error for invalid PDF ID', () => {
      expect(() => service.getPdfDetail(999)).toThrowError('Invalid PDF ID');
    });

    it('should throw error for negative PDF ID', () => {
      expect(() => service.getPdfDetail(-1)).toThrowError('Invalid PDF ID');
    });

    it('should throw error for zero PDF ID', () => {
      expect(() => service.getPdfDetail(0)).toThrowError('Invalid PDF ID');
    });

    it('should return different data for different valid IDs', () => {
      let result1: pdfDetailResponse;
      let result2: pdfDetailResponse;

      service.getPdfDetail(1).subscribe(result => {
        result1 = result;
      });

      service.getPdfDetail(2).subscribe(result => {
        result2 = result;
      });

      expect(result1!).not.toEqual(result2!);
      expect(result1!.id).not.toBe(result2!.id);
    });

    it('should validate PDF URL format', (done) => {
      service.getPdfDetail(1).subscribe(result => {
        expect(result.url).toMatch(/\.pdf$/);
        expect(result.url.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should have valid metadata structure', (done) => {
      service.getPdfDetail(1).subscribe(result => {
        expect(result.metadata.pages).toBeGreaterThan(0);

        if (result.metadata.author) {
          expect(typeof result.metadata.author).toBe('string');
          expect(result.metadata.author.length).toBeGreaterThan(0);
        }

        if (result.metadata.createdDate) {
          expect(result.metadata.createdDate).toBeInstanceOf(Date);
        }

        done();
      });
    });
  });

  describe('error handling', () => {
    it('should handle service instantiation gracefully', () => {
      expect(() => new PdfChatBotService(null as any)).not.toThrow();
    });
  });

  describe('data consistency', () => {
    it('should maintain referential integrity between list and details', (done) => {
      let pdfList: pdfListResponse[];

      service.getPdfList().subscribe(list => {
        pdfList = list;

        // Test that each PDF in the list can be retrieved by detail
        const testPromises = pdfList.map(pdf =>
          new Promise<void>((resolve) => {
            service.getPdfDetail(pdf.id).subscribe(detail => {
              expect(detail.id).toBe(pdf.id);
              expect(detail.title).toBe(pdf.title);
              resolve();
            });
          })
        );

        Promise.all(testPromises).then(() => done());
      });
    });

    it('should return immutable data', () => {
      let firstCall: pdfListResponse[];

      service.getPdfList().subscribe(result => {
        firstCall = result;
        // Try to modify the result
        firstCall.push({
          id: 999,
          title: 'Modified',
          description: 'Test',
          tags: [],
          uploadDate: new Date(),
          fileSize: '1MB'
        });
      });

      service.getPdfList().subscribe(result => {
        // Should not contain the modification
        expect(result.find(pdf => pdf.id === 999)).toBeUndefined();
      });
    });
  });

  describe('performance', () => {
    it('should return data quickly (under 100ms)', (done) => {
      const startTime = performance.now();

      service.getPdfList().subscribe(() => {
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(100);
        done();
      });
    });

    it('should handle multiple concurrent requests', () => {
      const promises = Array.from({ length: 10 }, () =>
        service.getPdfList().toPromise()
      );

      expect(() => Promise.all(promises)).not.toThrow();
    });
  });

  // Future HTTP integration tests (commented out for now)
  /*
  describe('HTTP integration (when backend is implemented)', () => {
    it('should call correct endpoint for getPdfList', () => {
      service.getPdfList().subscribe();

      const req = httpMock.expectOne('https://api.example.com/pdfs');
      expect(req.request.method).toBe('GET');
    });

    it('should call correct endpoint for getPdfDetail', () => {
      service.getPdfDetail(1).subscribe();

      const req = httpMock.expectOne('https://api.example.com/pdfs/1');
      expect(req.request.method).toBe('GET');
    });

    it('should handle HTTP errors gracefully', () => {
      service.getPdfList().subscribe(
        () => fail('should have failed'),
        error => expect(error).toBeTruthy()
      );

      const req = httpMock.expectOne('https://api.example.com/pdfs');
      req.error(new ErrorEvent('Network error'));
    });
  });
  */
});