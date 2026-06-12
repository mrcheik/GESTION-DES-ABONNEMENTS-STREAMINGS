import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { OrderService } from '../../core/services/order.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { PaymentService } from '../../core/services/payment.service';
import { PlanService } from '../../core/services/plan.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly paymentService = inject(PaymentService);
  private readonly planService = inject(PlanService);

  errorMessage = '';
  stats = { orders: 0, subscriptions: 0, payments: 0, plans: 0 };

  ngOnInit(): void {
    forkJoin({
      orders: this.orderService.getAll(),
      subscriptions: this.subscriptionService.getAll(),
      payments: this.paymentService.getAll(),
      plans: this.planService.getAll(),
    }).subscribe({
      next: ({ orders, subscriptions, payments, plans }) => {
        this.stats = {
          orders: orders.length,
          subscriptions: subscriptions.length,
          payments: payments.length,
          plans: plans.length,
        };
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques.';
      },
    });
  }
}
