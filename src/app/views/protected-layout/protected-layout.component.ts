import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

interface NavItem {
  label: string;
  path: string;
  icon: 'dashboard' | 'productos' | 'compras' | 'inventario' | 'pedidos' | 'reportes' | 'usuarios';
}

/** Shell del área autenticada: sidebar de navegación + topbar + contenido ruteado. */
@Component({
  selector: 'app-protected-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './protected-layout.component.html',
  styleUrl: './protected-layout.component.scss',
})
export class ProtectedLayoutComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);

  protected readonly sidebarOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { label: 'Productos', path: '/admin/productos', icon: 'productos' },
    { label: 'Compras', path: '/admin/compras', icon: 'compras' },
    { label: 'Inventario', path: '/admin/inventario', icon: 'inventario' },
    { label: 'Pedidos', path: '/admin/pedidos', icon: 'pedidos' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'usuarios' },
  ];

  protected readonly reportItems: NavItem[] = [
    { label: 'Reportes', path: '/admin/reportes', icon: 'reportes' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
