import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  providers: [MarkdownService],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss'],
})
export class ChatBotComponent implements OnChanges {
  @ViewChild('chatHistory') chatHistory!: ElementRef;
  @Input() aiResponse!: any; // TODO: Add type
  @Input() isLoading: boolean = true;

  @Output() userQuery = new EventEmitter<string>();

  messages: { text: string; isAI: boolean }[] = [];
  chatForm = new FormGroup({
    userInput: new FormControl(''),
  });

  ngOnChanges() {
    if (this.aiResponse) {
      this.messages.push({ text: this.aiResponse.answer, isAI: true });
      this.isLoading = false;
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }

  sendMessage() {
    const inputValue = this.chatForm.get('userInput')?.value;
    if (inputValue && !this.isLoading) {
      this.messages.push({ text: inputValue, isAI: false });
      this.userQuery.emit(inputValue);
      this.isLoading = true;
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
      this.chatForm.reset();
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the default behavior of the textarea
      this.sendMessage(); // Trigger the sendMessage method
    }
  }

  private scrollToBottom(): void {
      this.chatHistory.nativeElement.scrollTop = this.chatHistory.nativeElement.scrollHeight;
  }
}
