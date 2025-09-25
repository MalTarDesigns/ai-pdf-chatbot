import { Routes } from '@angular/router';
import { PdfTableComponent } from './pdf-table/pdf-table.component';
import { PdfChatComponent } from './pdf-chat/pdf-chat.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: PdfTableComponent, canActivate: [AuthGuard] },
  { path: 'pdf-viewer/:id', component: PdfChatComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
];
