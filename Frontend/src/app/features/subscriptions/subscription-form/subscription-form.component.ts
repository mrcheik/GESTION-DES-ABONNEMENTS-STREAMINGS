import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { PlanService } from '../../../core/services/plan.service';
import { Plan } from '../../../core/models/plan.model';
import { SubscriptionStatus } from '../../../core/models/subscription.model';
import { labelSubscriptionStatus } from '../../../core/utils/labels.util';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.scss',
})
export class SubscriptionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly planService = inject(PlanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  plans: Plan[] = [];
  isEditMode = false;
  subscriptionId: number | null = null;
  errorMessage = '';
  successMessage = '';
  createdSubscriptionId: number | null = null;

  readonly statusOptions: SubscriptionStatus[] = ['active', 'expired', 'cancelled'];
  readonly labelStatus = labelSubscriptionStatus;

  readonly form = this.fb.nonNullable.group({
    plan: ['', Validators.required],
    end_date: ['', Validators.required],
    status: ['active' as SubscriptionStatus, Validators.required],
  });

  ngOnInit(): void {
    this.planService.getAll().subscribe((plans) => {
      this.plans = plans;
      const planId = this.route.snapshot.queryParamMap.get('planId');
      if (planId) {
        this.form.patchValue({ plan: planId });
        this.updateEndDate(Number(planId));
      }
    });

    this.form.controls.plan.valueChanges.subscribe((planId) => {
      if (planId) this.updateEndDate(Number(planId));
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.subscriptionId = Number(idParam);
      this.subscriptionService.getById(this.subscriptionId).subscribe({
        next: (subscription) => {
          this.form.patchValue({
            plan: String(subscription.plan),
            end_date: subscription.end_date.slice(0, 16),
            status: subscription.status,
          });
        },
        error: () => (this.errorMessage = 'Abonnement introuvable.'),
      });
    }
  }

  private updateEndDate(planId: number): void {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;
    const end = new Date();
    end.setDate(end.getDate() + plan.duration_days);
    const local = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.form.patchValue({ end_date: local }, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      plan: Number(raw.plan),
      end_date: new Date(raw.end_date).toISOString(),
      status: raw.status,
    };

    this.errorMessage = '';
    this.successMessage = '';

    const request$ =
      this.isEditMode && this.subscriptionId
        ? this.subscriptionService.update(this.subscriptionId, payload)
        : this.subscriptionService.create(payload);

    request$.subscribe({
      next: (sub) => {
        this.successMessage = this.isEditMode
          ? 'Abonnement mis à jour avec succès.'
          : 'Abonnement créé avec succès.';
        const target = this.isEditMode ? ['/subscriptions'] : ['/payments/new'];
        const queryParams = this.isEditMode ? undefined : { subscriptionId: sub.id, amount: this.getPlanPrice(payload.plan) };
        setTimeout(() => this.router.navigate(target, { queryParams }), 1200);
      },
      error: (err) => {
        this.errorMessage = this.extractErrorMessage(err);
      },
    });
  }

  private getPlanPrice(planId: number): string {
    return this.plans.find((p) => p.id === planId)?.price ?? '';
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
