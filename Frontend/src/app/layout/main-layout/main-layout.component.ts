import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .main-content {
        width: min(100% - 2rem, 1280px);
        margin: 0 auto;
        padding: 1.5rem 0 2.5rem;
        min-height: calc(100vh - 72px);
      }

      @media (max-width: 575px) {
        .main-content {
          width: min(100% - 1rem, 1280px);
          padding-top: 1rem;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {}
