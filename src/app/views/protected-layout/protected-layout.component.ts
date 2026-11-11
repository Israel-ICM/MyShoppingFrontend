import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell placeholder for the authenticated area (behind authGuard). */
@Component({
  selector: 'app-protected-layout',
  imports: [RouterOutlet],
  templateUrl: './protected-layout.component.html',
  styleUrl: './protected-layout.component.scss',
})
export class ProtectedLayoutComponent {}
