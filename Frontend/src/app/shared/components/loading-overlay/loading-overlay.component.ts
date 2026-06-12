import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  template: `
    @if (loadingService.loading()) {
      <div class="loading-overlay">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="loading-text">Chargement en cours...</p>
      </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(2px);
      }

      .loading-text {
        margin: 0;
        color: #f8fafc;
        font-weight: 500;
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  readonly loadingService = inject(LoadingService);
}
