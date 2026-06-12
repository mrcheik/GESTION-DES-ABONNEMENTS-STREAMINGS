import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { OrderService } from '../../../core/services/order.service';
import { PlanService } from '../../../core/services/plan.service';
import { Plan } from '../../../core/models/plan.model';
import { OrderStatus } from '../../../core/models/order.model';
import { labelOrderStatus } from '../../../core/utils/labels.util';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
})
export class OrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly planService = inject(PlanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  plans: Plan[] = [];
  isEditMode = false;
  orderId: number | null = null;
  errorMessage = '';
  successMessage = '';
  providerLabel = '';

  readonly statusOptions: OrderStatus[] = ['pending', 'paid', 'cancelled'];
  readonly labelStatus = labelOrderStatus;

  readonly form = this.fb.nonNullable.group({
    plan: ['', Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    status: ['pending' as OrderStatus, Validators.required],
  });

  ngOnInit(): void {
    this.providerLabel = this.route.snapshot.queryParamMap.get('provider') ?? '';

    this.planService.getAll().subscribe((plans) => {
      this.plans = plans;
      const planId = this.route.snapshot.queryParamMap.get('planId');
      const amount = this.route.snapshot.queryParamMap.get('amount');
      if (planId) {
        this.form.patchValue({ plan: planId, amount: amount ?? '' });
      }
    });

    this.form.controls.plan.valueChanges.subscribe((planId) => {
      const plan = this.plans.find((p) => p.id === Number(planId));
      if (plan) {
        this.form.patchValue({ amount: plan.price }, { emitEvent: false });
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.orderId = Number(idParam);
      this.orderService.getById(this.orderId).subscribe({
        next: (order) => {
          this.form.patchValue({
            plan: String(order.plan),
            amount: order.amount,
            status: order.status,
          });
        },
        error: () => (this.errorMessage = 'Commande introuvable.'),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    const raw = this.form.getRawValue();
    const payload = {
      plan: Number(raw.plan),
      amount: raw.amount,
      status: raw.status,
    };

    const request$ =
      this.isEditMode && this.orderId
        ? this.orderService.update(this.orderId, payload)
        : this.orderService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.isEditMode
          ? 'Commande mise à jour avec succès.'
          : 'Commande créée avec succès.';
        const planId = payload.plan;
        const target =
          !this.isEditMode && payload.status === 'paid'
            ? ['/subscriptions/new']
            : ['/orders'];
        const queryParams =
          !this.isEditMode && payload.status === 'paid' ? { planId } : undefined;
        setTimeout(() => this.router.navigate(target, { queryParams }), 1200);
      },
      error: (err) => {
        this.errorMessage = this.extractErrorMessage(err);
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
