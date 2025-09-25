import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { PdfTableComponent } from './pdf-table/pdf-table.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PdfTableComponent, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular_pdf_chat';
}
