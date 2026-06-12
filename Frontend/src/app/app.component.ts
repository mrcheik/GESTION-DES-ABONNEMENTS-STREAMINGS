import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterLink, RouterOutlet, LoadingOverlayComponent],
  template: `
    <app-loading-overlay />
    <header class="guest-header" *ngIf="!isAuthenticated">
      <div class="container-fluid d-flex justify-content-end align-items-center py-2 px-3">
        <a routerLink="/login" class="btn btn-accent btn-sm me-2">Connexion</a>
        <a routerLink="/register" class="btn btn-outline-primary btn-sm">Inscription</a>
      </div>
    </header>
    <router-outlet />
  `,
  styles: [
    `
      .guest-header {
        position: sticky;
        top: 0;
        z-index: 1200;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }
    `,
  ],
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
