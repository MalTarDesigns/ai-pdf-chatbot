import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../services/auth.service';
import { PdfChatBotService } from '../services/pdf-chat-bot.service';
import { pdfListResponse } from '../services/pdf-chat-bot.models';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-pdf-table',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    HeaderComponent,
  ],
  providers: [AuthService, PdfChatBotService],
  templateUrl: './pdf-table.component.html',
  styleUrl: './pdf-table.component.scss',
})
export class PdfTableComponent implements OnInit {
  pdfList: pdfListResponse[] = [];
  displayedColumns: string[] = ['title', 'description', 'view'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private pdfChatBotService: PdfChatBotService
  ) {}

  ngOnInit() {
    this.pdfChatBotService.getPdfList().subscribe((data) => {
      this.pdfList = data;
      console.log('PDF List:', this.pdfList);
    });
  }

  navigateToPdfViewer(id: number) {
    console.log('Navigating to pdf viewer');
    this.router.navigate(['/pdf-viewer', id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
