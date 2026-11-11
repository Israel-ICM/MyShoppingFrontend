import { Component } from '@angular/core';

/**
 * Full lockup logo (icon + wordmark). The `.svg` already has `fill="currentColor"` on its
 * root element, so color is fully controlled via CSS (`:host { color: ... }`), never edited here.
 */
@Component({
  selector: 'app-logo',
  templateUrl: './logo-full.svg',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {}
