import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaymentService } from '../../../core/services/payment.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../core/models/subscription.model';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../core/models/payment.model';
import {
  labelPaymentMethod,
  labelPaymentStatus,
} from '../../../core/utils/labels.util';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  subscriptions: Subscription[] = [];
  isEditMode = false;
  paymentId: number | null = null;
  errorMessage = '';
  successMessage = '';

  readonly methodOptions: PaymentMethod[] = ['mtn', 'orange', 'card'];
  readonly statusOptions: PaymentStatus[] = ['pending', 'completed', 'failed'];
  readonly labelMethod = labelPaymentMethod;
  readonly labelStatus = labelPaymentStatus;

  readonly form = this.fb.nonNullable.group({
    subscription: ['', Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    payment_method: ['mtn' as PaymentMethod, Validators.required],
    status: ['pending' as PaymentStatus, Validators.required],
    transaction_id: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.paymentId = Number(idParam);
      this.paymentService.getById(this.paymentId).subscribe({
        next: (payment) => {
          this.form.patchValue({
            subscription: String(payment.subscription),
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: payment.status,
            transaction_id: payment.transaction_id,
          });
        },
        error: () => (this.errorMessage = 'Paiement introuvable.'),
      });
      return;
    }

    this.subscriptionService.getAll().subscribe((subs) => {
      this.subscriptions = subs;
      const subId = this.route.snapshot.queryParamMap.get('subscriptionId');
      const amount = this.route.snapshot.queryParamMap.get('amount');
      if (subId) {
        this.form.patchValue({
          subscription: subId,
          amount: amount ?? '',
          transaction_id: this.generateTransactionId(),
        });
      } else {
        this.form.patchValue({ transaction_id: this.generateTransactionId() });
      }
    });
  }

  private generateTransactionId(): string {
    return `MC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      subscription: Number(raw.subscription),
      amount: raw.amount,
      payment_method: raw.payment_method,
      status: raw.status,
      transaction_id: raw.transaction_id,
    };

    this.errorMessage = '';
    this.successMessage = '';

    const request$ =
      this.isEditMode && this.paymentId
        ? this.paymentService.update(this.paymentId, payload)
        : this.paymentService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Paiement mis à jour avec succès.'
          : 'Paiement enregistré avec succès.';
        setTimeout(() => this.router.navigate(['/payments']), 1200);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.transaction_id?.[0] || this.extractErrorMessage(err);
      },
    });
  }

  private extractErrorMessage(err: { error?: Record<string, string[] | string> | string }): string {
    if (typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error === 'object') {
      const detail = (err.error as Record<string, unknown>)['detail'];
      if (typeof detail === 'string') return detail;
      const first = Object.values(err.error)[0];
      if (Array.isArray(first)) return first[0];
    }
    return 'Une erreur est survenue.';
  }
}
