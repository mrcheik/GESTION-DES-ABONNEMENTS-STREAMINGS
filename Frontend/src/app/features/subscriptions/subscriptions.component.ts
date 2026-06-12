import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SubscriptionService } from '../../core/services/subscription.service';
import { PlanService } from '../../core/services/plan.service';
import { Subscription } from '../../core/models/subscription.model';
import {
  labelSubscriptionStatus,
  statusBadgeClass,
} from '../../core/utils/labels.util';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [RouterLink, DatePipe, PageHeaderComponent],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss',
})
export class SubscriptionsComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly planService = inject(PlanService);

  subscriptions: Subscription[] = [];
  planMap = new Map<number, string>();
  errorMessage = '';

  readonly labelStatus = labelSubscriptionStatus;
  readonly statusClass = (s: string) => statusBadgeClass(s, 'subscription');

  ngOnInit(): void {
    forkJoin({
      subscriptions: this.subscriptionService.getAll(),
      plans: this.planService.getAll(),
    }).subscribe({
      next: ({ subscriptions, plans }) => {
        this.subscriptions = subscriptions;
        this.planMap = new Map(plans.map((p) => [p.id, p.name]));
      },
      error: () => (this.errorMessage = 'Impossible de charger les abonnements.'),
    });
  }

  getPlanName(planId: number): string {
    return this.planMap.get(planId) ?? `Forfait #${planId}`;
  }
}
