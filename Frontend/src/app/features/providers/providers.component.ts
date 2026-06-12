import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProviderService } from '../../core/services/provider.service';
import { Provider } from '../../core/models/provider.model';
import { DEFAULT_LOGO_URL, resolveLogoUrl } from '../../core/utils/media.util';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss',
})
export class ProvidersComponent implements OnInit {
  private readonly providerService = inject(ProviderService);
  private readonly fb = inject(FormBuilder);

  providers: Provider[] = [];
  errorMessage = '';
  successMessage = '';
  editingProvider: Provider | null = null;
  selectedLogo: File | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.providerService.getAll().subscribe({
      next: (data) => (this.providers = data),
      error: () => (this.errorMessage = 'Impossible de charger les fournisseurs.'),
    });
  }

  logoUrl(provider: Provider): string {
    return resolveLogoUrl(provider.logo_url, provider.name);
  }

  onLogoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = DEFAULT_LOGO_URL;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedLogo = input.files?.[0] ?? null;
  }

  edit(provider: Provider): void {
    this.editingProvider = provider;
    this.selectedLogo = null;
    this.form.patchValue({
      name: provider.name,
      description: provider.description ?? '',
    });
  }

  cancelEdit(): void {
    this.editingProvider = null;
    this.selectedLogo = null;
    this.form.reset({ name: '', description: '' });
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
      name: raw.name,
      description: raw.description,
      logo: this.selectedLogo,
    };

    const request$ = this.editingProvider
      ? this.providerService.update(this.editingProvider.id, payload)
      : this.providerService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingProvider
          ? 'Fournisseur mis à jour avec succès.'
          : 'Fournisseur ajouté avec succès.';
        this.cancelEdit();
        this.loadProviders();
      },
      error: (err) => (this.errorMessage = this.extractErrorMessage(err)),
    });
  }

  delete(provider: Provider): void {
    if (!confirm(`Supprimer le fournisseur "${provider.name}" ?`)) return;

    this.providerService.delete(provider.id).subscribe({
      next: () => {
        this.successMessage = 'Fournisseur supprimé avec succès.';
        this.providers = this.providers.filter((item) => item.id !== provider.id);
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
