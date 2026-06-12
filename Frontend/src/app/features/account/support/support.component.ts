import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AccountService } from '../../../core/services/account.service';
import { SupportThread } from '../../../core/models/admin.model';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly fb = inject(FormBuilder);

  threads: SupportThread[] = [];
  selectedThread: SupportThread | null = null;
  errorMessage = '';
  successMessage = '';

  readonly threadForm = this.fb.nonNullable.group({
    subject: ['', Validators.required],
  });

  readonly messageForm = this.fb.nonNullable.group({
    body: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadThreads();
  }

  loadThreads(): void {
    this.accountService.getThreads().subscribe({
      next: (threads) => {
        this.threads = threads;
        this.selectedThread = this.selectedThread
          ? threads.find((thread) => thread.id === this.selectedThread?.id) ?? threads[0] ?? null
          : threads[0] ?? null;
      },
      error: () => (this.errorMessage = 'Impossible de charger vos conversations.'),
    });
  }

  createThread(): void {
    if (this.threadForm.invalid) {
      this.threadForm.markAllAsTouched();
      return;
    }
    this.accountService.createThread(this.threadForm.getRawValue().subject).subscribe({
      next: (thread) => {
        this.threadForm.reset({ subject: '' });
        this.selectedThread = thread;
        this.successMessage = 'Conversation créée.';
        this.loadThreads();
      },
    });
  }

  selectThread(thread: SupportThread): void {
    this.selectedThread = thread;
  }

  sendMessage(): void {
    if (!this.selectedThread || this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }
    this.accountService.sendMessage(this.selectedThread.id, this.messageForm.getRawValue().body).subscribe({
      next: () => {
        this.messageForm.reset({ body: '' });
        this.successMessage = 'Message envoyé.';
        this.loadThreads();
      },
    });
  }
}
