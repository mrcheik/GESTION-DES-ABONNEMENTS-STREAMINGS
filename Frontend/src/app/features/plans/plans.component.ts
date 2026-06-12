import { Component, inject, OnInit } from '@angular/core';
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
  imports: [PageHeaderComponent, PlanCardComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly providerService = inject(ProviderService);

  plans: Plan[] = [];
  providerMap = new Map<number, Provider>();
  errorMessage = '';

  ngOnInit(): void {
    forkJoin({
      plans: this.planService.getAll(),
      providers: this.providerService.getAll(),
    }).subscribe({
      next: ({ plans, providers }) => {
        this.plans = plans;
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
}
