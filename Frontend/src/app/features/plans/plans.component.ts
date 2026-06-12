import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PlanService } from '../../core/services/plan.service';
import { ProviderService } from '../../core/services/provider.service';
import { Plan } from '../../core/models/plan.model';
import { Provider } from '../../core/models/provider.model';
import { PlanCardComponent } from '../../shared/components/plan-card/plan-card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent, PlanCardComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly providerService = inject(ProviderService);
  private readonly fb = inject(FormBuilder);

  plans: Plan[] = [];
  providers: Provider[] = [];
  providerMap = new Map<number, Provider>();
  errorMessage = '';
  successMessage = '';
  editingPlan: Plan | null = null;

  readonly form = this.fb.nonNullable.group({
    provider: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    duration_days: [30, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      plans: this.planService.getAll(),
      providers: this.providerService.getAll(),
    }).subscribe({
      next: ({ plans, providers }) => {
        this.plans = plans;
        this.providers = providers;
        this.providerMap = new Map(providers.map((p) => [p.id, p]));
      },
      error: () => (this.errorMessage = 'Impossible de charger les forfaits.'),
    });
  }

  getProviderName(plan: Plan): string {
    return (
      plan.provider_details?.name ??
      this.providerMap.get(plan.provider)?.name ??
      `Fournisseur #${plan.provider}`
    );
  }

  getLogoUrl(plan: Plan): string | null {
    return (
      plan.provider_details?.logo_url ??
      this.providerMap.get(plan.provider)?.logo_url ??
      null
    );
  }

  edit(plan: Plan): void {
    this.editingPlan = plan;
    this.form.patchValue({
      provider: String(plan.provider),
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
    });
  }

  cancelEdit(): void {
    this.editingPlan = null;
    this.form.reset({ provider: '', name: '', price: '', duration_days: 30 });
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
      provider: Number(raw.provider),
      name: raw.name,
      price: raw.price,
      duration_days: Number(raw.duration_days),
    };

    const request$ = this.editingPlan
      ? this.planService.update(this.editingPlan.id, payload)
      : this.planService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingPlan
          ? 'Forfait mis à jour avec succès.'
          : 'Forfait ajouté avec succès.';
        this.cancelEdit();
        this.loadData();
      },
      error: (err) => (this.errorMessage = this.extractErrorMessage(err)),
    });
  }

  delete(plan: Plan): void {
    if (!confirm(`Supprimer le forfait "${plan.name}" ?`)) return;

    this.planService.delete(plan.id).subscribe({
      next: () => {
        this.successMessage = 'Forfait supprimé avec succès.';
        this.plans = this.plans.filter((item) => item.id !== plan.id);
      },
      error: (err) => (this.errorMessage = this.extractErrorMessage(err)),
    });
  }

  private extractErrorMessage(err: { error?: Record<string, string[] | string> | string }): string {
    if (typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error === 'object') {
      const detail = (err.error as Record<string, unknown>)['detail'];
      if (typeof detail === 'string') return detail;
      const first = Object.values(err.error)[0];
      if (Array.isArray(first)) return first[0];
      if (typeof first === 'string') return first;
    }
    return 'Une erreur est survenue.';
  }
}
