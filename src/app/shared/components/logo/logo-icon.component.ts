import { Component } from '@angular/core';

/**
 * Icon-only logo mark. The `.svg` already has `fill="currentColor"` on its root element,
 * so color is fully controlled via CSS (`:host { color: ... }`), never edited here.
 */
@Component({
  selector: 'app-logo-icon',
  templateUrl: './logo-icon.svg',
  styleUrl: './logo-icon.component.scss',
})
export class LogoIconComponent {}
