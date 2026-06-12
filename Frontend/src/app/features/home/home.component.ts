import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PlanService } from '../../core/services/plan.service';
import { ProviderService } from '../../core/services/provider.service';
import { Plan } from '../../core/models/plan.model';
import { Provider } from '../../core/models/provider.model';
import { PlanCardComponent } from '../../shared/components/plan-card/plan-card.component';
import { resolveLogoUrl } from '../../core/utils/media.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlanCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly providerService = inject(ProviderService);

  plans: Plan[] = [];
  providers: Provider[] = [];
  providerMap = new Map<number, Provider>();
  errorMessage = '';
  loading = true;

  readonly features = [
    {
      icon: 'bi-lightning-charge-fill',
      title: 'Livraison en temps réel',
      text: 'Activation immédiate après paiement, sans attente.',
      color: '#FF9A1F',
    },
    {
      icon: 'bi-shield-lock-fill',
      title: 'Certificat SSL',
      text: 'Paiements sécurisés dans un environnement protégé.',
      color: '#48A9A6',
    },
    {
      icon: 'bi-headset',
      title: 'Service 24/7',
      text: 'Assistance en ligne à tout moment.',
      color: '#1867C0',
    },
    {
      icon: 'bi-piggy-bank-fill',
      title: 'Prix abordable',
      text: 'Abonnements premium à prix réduit.',
      color: '#8F4DE8',
    },
  ];

  ngOnInit(): void {
    forkJoin({
      plans: this.planService.getAll(),
      providers: this.providerService.getAll(),
    }).subscribe({
      next: ({ plans, providers }) => {
        this.plans = plans;
        this.providers = providers;
        this.providerMap = new Map(providers.map((p) => [p.id, p]));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le catalogue.';
        this.loading = false;
      },
    });
  }

  getProvider(plan: Plan): Provider | undefined {
    return plan.provider_details ?? this.providerMap.get(plan.provider);
  }

  getProviderName(plan: Plan): string {
    return this.getProvider(plan)?.name ?? `Fournisseur #${plan.provider}`;
  }

  getProviderLogo(provider: Provider): string {
    return resolveLogoUrl(provider.logo_url, provider.name);
  }
}
