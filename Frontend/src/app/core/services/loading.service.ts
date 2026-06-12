import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly requestCount = signal(0);
  readonly loading = signal(false);

  show(): void {
    this.requestCount.update((count) => count + 1);
    this.loading.set(true);
  }

  hide(): void {
    this.requestCount.update((count) => Math.max(0, count - 1));
    if (this.requestCount() === 0) {
      this.loading.set(false);
    }
  }
}
