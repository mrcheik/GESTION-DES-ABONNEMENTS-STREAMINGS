import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content container-fluid py-4">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .main-content {
        max-width: 1280px;
        min-height: calc(100vh - 72px);
      }
    `,
  ],
})
export class MainLayoutComponent {}
