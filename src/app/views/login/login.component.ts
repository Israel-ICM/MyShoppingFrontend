import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

/** `required` también falla cuando el valor son solo espacios en blanco (REQ-5.2). */
function requiredTrimmed(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length > 0 ? null : { required: true };
}

/**
 * Login standalone con Reactive Forms (REQ-5). Lógica fijada en Fase 6; el markup/estilo
 * final (glass card, tokens de diseño) se ensambló en Fase 7 sobre este mismo componente.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly theme = this.themeService.theme;

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [requiredTrimmed] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected isInvalid(controlName: 'username' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  onSubmit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.form.getRawValue();

    this.authService.login(username.trim(), password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
