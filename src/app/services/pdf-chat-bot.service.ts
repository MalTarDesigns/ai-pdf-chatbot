import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { pdfDetailResponse, pdfListResponse } from './pdf-chat-bot.models';
import { pdfDetailData1, pdfDetailData2, pdfListData } from '../mock-data';

@Injectable({
  providedIn: 'root',
})
export class PdfChatBotService {
  constructor(private http: HttpClient) {}

  getPdfList(): Observable<pdfListResponse[]> {
    return of(pdfListData);
    // return this.http.get<pdfListResponse[]>('https://api.example.com/pdfs');
  }

  getPdfDetail(id: number): Observable<pdfDetailResponse> {
    if (id === 1) {
      return of(pdfDetailData1);
    } else if (id === 2) {
      return of(pdfDetailData2);
    } else {
      throw new Error('Invalid PDF ID');
    }
  }
  // return this.http.get(`https://api.example.com/pdfs/${id}`);
}
