import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { OrderService } from '../../core/services/order.service';
import { PlanService } from '../../core/services/plan.service';
import { Order } from '../../core/models/order.model';
import {
  labelOrderStatus,
  statusBadgeClass,
} from '../../core/utils/labels.util';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, PageHeaderComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly planService = inject(PlanService);

  orders: Order[] = [];
  planMap = new Map<number, string>();
  errorMessage = '';

  readonly labelStatus = labelOrderStatus;
  readonly statusClass = (s: string) => statusBadgeClass(s, 'order');

  ngOnInit(): void {
    forkJoin({
      orders: this.orderService.getAll(),
      plans: this.planService.getAll(),
    }).subscribe({
      next: ({ orders, plans }) => {
        this.orders = orders;
        this.planMap = new Map(plans.map((p) => [p.id, p.name]));
      },
      error: () => (this.errorMessage = 'Impossible de charger les commandes.'),
    });
  }

  getPlanName(planId: number): string {
    return this.planMap.get(planId) ?? `Forfait #${planId}`;
  }
}
