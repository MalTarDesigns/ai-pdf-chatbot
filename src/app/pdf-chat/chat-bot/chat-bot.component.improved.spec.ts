import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatBotComponent } from './chat-bot.component';

describe('ChatBotComponent - Improved Tests', () => {
  let component: ChatBotComponent;
  let fixture: ComponentFixture<ChatBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatBotComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MarkdownModule.forRoot(),
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty messages array', () => {
    expect(component.messages).toEqual([]);
  });

  it('should initialize with loading state true', () => {
    expect(component.isLoading).toBe(true);
  });

  it('should have a reactive form with userInput control', () => {
    expect(component.chatForm.get('userInput')).toBeDefined();
    expect(component.chatForm.get('userInput')?.value).toBe('');
  });

  describe('sendMessage', () => {
    it('should not send empty message', () => {
      spyOn(component.userQuery, 'emit');
      component.chatForm.get('userInput')?.setValue('');

      component.sendMessage();

      expect(component.userQuery.emit).not.toHaveBeenCalled();
    });

    it('should not send message when loading', () => {
      spyOn(component.userQuery, 'emit');
      component.chatForm.get('userInput')?.setValue('test message');
      component.isLoading = true;

      component.sendMessage();

      expect(component.userQuery.emit).not.toHaveBeenCalled();
    });

    it('should send message and update state when valid', () => {
      spyOn(component.userQuery, 'emit');
      const testMessage = 'test message';
      component.chatForm.get('userInput')?.setValue(testMessage);
      component.isLoading = false;

      component.sendMessage();

      expect(component.userQuery.emit).toHaveBeenCalledWith(testMessage);
      expect(component.messages).toContain({ text: testMessage, isAI: false });
      expect(component.isLoading).toBe(true);
      expect(component.chatForm.get('userInput')?.value).toBe('');
    });

    it('should trim whitespace from messages', () => {
      spyOn(component.userQuery, 'emit');
      const testMessage = '  test message  ';
      component.chatForm.get('userInput')?.setValue(testMessage);
      component.isLoading = false;

      component.sendMessage();

      expect(component.userQuery.emit).toHaveBeenCalledWith(testMessage);
      expect(component.messages).toContain({ text: testMessage, isAI: false });
    });
  });

  describe('onEnter', () => {
    it('should call sendMessage on Enter key without shift', () => {
      spyOn(component, 'sendMessage');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      spyOn(enterEvent, 'preventDefault');

      component.onEnter(enterEvent);

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should not call sendMessage on Shift+Enter', () => {
      spyOn(component, 'sendMessage');
      const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });

      component.onEnter(shiftEnterEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should not prevent default on Shift+Enter', () => {
      const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      spyOn(shiftEnterEvent, 'preventDefault');

      component.onEnter(shiftEnterEvent);

      expect(shiftEnterEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should add AI response to messages when aiResponse changes', () => {
      const mockResponse = { answer: 'AI response test' };
      component.aiResponse = mockResponse;
      component.isLoading = true;

      component.ngOnChanges();

      expect(component.messages).toContain({ text: mockResponse.answer, isAI: true });
      expect(component.isLoading).toBe(false);
    });

    it('should not add message when aiResponse is null', () => {
      const initialMessageCount = component.messages.length;
      component.aiResponse = null;

      component.ngOnChanges();

      expect(component.messages.length).toBe(initialMessageCount);
    });

    it('should not add message when aiResponse is undefined', () => {
      const initialMessageCount = component.messages.length;
      component.aiResponse = undefined;

      component.ngOnChanges();

      expect(component.messages.length).toBe(initialMessageCount);
    });

    it('should handle complex AI response objects', () => {
      const complexResponse = {
        answer: 'Complex AI response',
        sources: ['page 1', 'page 2'],
        confidence: 0.95
      };
      component.aiResponse = complexResponse;

      component.ngOnChanges();

      expect(component.messages).toContain({ text: complexResponse.answer, isAI: true });
    });
  });

  describe('scrollToBottom', () => {
    it('should scroll chat history to bottom', () => {
      // Mock the ViewChild element
      const mockElement = {
        nativeElement: {
          scrollTop: 0,
          scrollHeight: 1000
        }
      };
      component.chatHistory = mockElement as any;

      component['scrollToBottom']();

      expect(mockElement.nativeElement.scrollTop).toBe(1000);
    });

    it('should handle missing chat history element gracefully', () => {
      component.chatHistory = undefined as any;

      expect(() => component['scrollToBottom']()).not.toThrow();
    });
  });

  describe('message display', () => {
    it('should display user and AI messages correctly', () => {
      const userMessage = { text: 'User question', isAI: false };
      const aiMessage = { text: 'AI answer', isAI: true };

      component.messages = [userMessage, aiMessage];
      fixture.detectChanges();

      const messageElements = fixture.nativeElement.querySelectorAll('.message');
      expect(messageElements.length).toBe(2);
    });

    it('should show loading spinner when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when isLoading is false', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('form validation', () => {
    it('should disable send button when input is empty', () => {
      component.chatForm.get('userInput')?.setValue('');
      component.isLoading = false;
      fixture.detectChanges();

      const sendButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(sendButton?.disabled).toBe(true);
    });

    it('should disable send button when loading', () => {
      component.chatForm.get('userInput')?.setValue('test message');
      component.isLoading = true;
      fixture.detectChanges();

      const sendButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(sendButton?.disabled).toBe(true);
    });

    it('should enable send button when input has value and not loading', () => {
      component.chatForm.get('userInput')?.setValue('test message');
      component.isLoading = false;
      fixture.detectChanges();

      const sendButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(sendButton?.disabled).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should complete full chat interaction flow', async () => {
      spyOn(component.userQuery, 'emit');

      // User types message
      const input = fixture.nativeElement.querySelector('textarea');
      input.value = 'What is this document about?';
      input.dispatchEvent(new Event('input'));

      component.isLoading = false;
      fixture.detectChanges();

      // User clicks send
      const sendButton = fixture.nativeElement.querySelector('button[type="submit"]');
      sendButton.click();

      // Verify user message was added and emitted
      expect(component.userQuery.emit).toHaveBeenCalledWith('What is this document about?');
      expect(component.messages).toContain({ text: 'What is this document about?', isAI: false });
      expect(component.isLoading).toBe(true);

      // Simulate AI response
      component.aiResponse = { answer: 'This document discusses ELD regulations.' };
      component.ngOnChanges();

      // Verify AI response was added and loading stopped
      expect(component.messages).toContain({
        text: 'This document discusses ELD regulations.',
        isAI: true
      });
      expect(component.isLoading).toBe(false);
    });
  });
});