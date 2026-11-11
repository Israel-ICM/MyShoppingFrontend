import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  template: `
    <div class="placeholder">
      <h2 class="placeholder__title">{{ title() }}</h2>
      <p class="placeholder__text">Esta sección está en construcción.</p>
    </div>
  `,
  styles: `
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      background: var(--color-surface-glass);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      box-shadow: var(--shadow-sm);
    }

    @supports not (backdrop-filter: blur(1px)) {
      .placeholder {
        background: var(--color-surface);
      }
    }

    .placeholder__title {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--font-size-lg);
      color: var(--color-text);
    }

    .placeholder__text {
      margin: 0;
      font-family: var(--font-sans);
      color: var(--color-text-muted);
    }
  `,
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = signal(this.route.snapshot.data['title'] ?? 'Sección');
}
