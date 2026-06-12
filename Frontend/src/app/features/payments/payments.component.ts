import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaymentService } from '../../core/services/payment.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { PlanService } from '../../core/services/plan.service';
import { Payment } from '../../core/models/payment.model';
import {
  labelPaymentMethod,
  labelPaymentStatus,
  statusBadgeClass,
} from '../../core/utils/labels.util';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [RouterLink, DatePipe, PageHeaderComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
})
export class PaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly planService = inject(PlanService);

  payments: Payment[] = [];
  subscriptionLabelMap = new Map<number, string>();
  errorMessage = '';

  readonly labelStatus = labelPaymentStatus;
  readonly labelMethod = labelPaymentMethod;
  readonly statusClass = (s: string) => statusBadgeClass(s, 'payment');

  ngOnInit(): void {
    forkJoin({
      payments: this.paymentService.getAll(),
      subscriptions: this.subscriptionService.getAll(),
      plans: this.planService.getAll(),
    }).subscribe({
      next: ({ payments, subscriptions, plans }) => {
        this.payments = payments;
        const planMap = new Map(plans.map((p) => [p.id, p.name]));
        this.subscriptionLabelMap = new Map(
          subscriptions.map((s) => [
            s.id,
            `${planMap.get(s.plan) ?? 'Forfait #' + s.plan} (#${s.id})`,
          ])
        );
      },
      error: () => (this.errorMessage = 'Impossible de charger les paiements.'),
    });
  }

  getSubscriptionLabel(id: number): string {
    return this.subscriptionLabelMap.get(id) ?? `Abonnement #${id}`;
  }

  delete(payment: Payment): void {
    if (!confirm(`Supprimer le paiement ${payment.transaction_id} ?`)) return;

    this.paymentService.delete(payment.id).subscribe({
      next: () => (this.payments = this.payments.filter((item) => item.id !== payment.id)),
      error: () => (this.errorMessage = 'Impossible de supprimer le paiement.'),
    });
  }
}
