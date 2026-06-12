import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plan } from '../../../core/models/plan.model';
import { resolveLogoUrl } from '../../../core/utils/media.util';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './plan-card.component.html',
  styleUrl: './plan-card.component.scss',
})
export class PlanCardComponent {
  @Input({ required: true }) plan!: Plan;
  @Input() providerName = 'Fournisseur';
  @Input() logoUrl: string | null = null;

  get displayLogo(): string {
    return resolveLogoUrl(
      this.logoUrl ?? this.plan.provider_details?.logo_url ?? null,
      this.providerName
    );
  }

  get priceLabel(): string {
    return `${this.plan.price} FCFA`;
  }
}
