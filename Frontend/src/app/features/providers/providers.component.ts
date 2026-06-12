import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProviderService } from '../../core/services/provider.service';
import { Provider } from '../../core/models/provider.model';
import { resolveLogoUrl } from '../../core/utils/media.util';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss',
})
export class ProvidersComponent implements OnInit {
  private readonly providerService = inject(ProviderService);

  providers: Provider[] = [];
  errorMessage = '';

  ngOnInit(): void {
    this.providerService.getAll().subscribe({
      next: (data) => (this.providers = data),
      error: () => (this.errorMessage = 'Impossible de charger les fournisseurs.'),
    });
  }

  logoUrl(provider: Provider): string {
    return resolveLogoUrl(provider.logo_url, provider.name);
  }
}
