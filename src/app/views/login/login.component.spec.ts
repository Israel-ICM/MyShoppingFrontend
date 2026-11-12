import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

interface AuthServiceMock {
  login: ReturnType<typeof vi.fn>;
}

interface RouterMock {
  navigate: ReturnType<typeof vi.fn>;
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: AuthServiceMock;
  let router: RouterMock;

  function setup(): void {
    authService = { login: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function setUsername(value: string): void {
    component.form.controls.username.setValue(value);
    component.form.controls.username.markAsDirty();
  }

  function setPassword(value: string): void {
    component.form.controls.password.setValue(value);
    component.form.controls.password.markAsDirty();
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function alertTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="alert"]')).map(
      (el) => (el as HTMLElement).textContent ?? '',
    );
  }

  beforeEach(() => setup());

  // REQ-5.1
  it('starts with an invalid form and the submit button disabled', () => {
    expect(component.form.invalid).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  // REQ-5.2
  it('marks username as invalid when empty or whitespace-only, with accessible feedback', () => {
    setUsername('   ');
    setPassword('secret123');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    expect(component.form.controls.username.invalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector(`#${describedBy}`);
    expect(errorEl?.getAttribute('role')).toBe('alert');
  });

  // REQ-5.3
  it('marks password as invalid when empty', () => {
    setUsername('ana');
    setPassword('');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    expect(component.form.controls.password.invalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  // REQ-5.4
  it('is valid and enables submit when both fields have a value', () => {
    setUsername('ana');
    setPassword('secret123');
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);
    expect(submitButton().disabled).toBe(false);
  });

  // REQ-5.5
  it('sets loading and calls AuthService.login with the trimmed username on a valid submit', () => {
    authService.login.mockReturnValue(new Subject());
    setUsername('  ana  ');
    setPassword('secret123');
    fixture.detectChanges();

    component.onSubmit();

    expect(component.loading()).toBe(true);
    expect(authService.login).toHaveBeenCalledWith('ana', 'secret123');
  });

  // REQ-5.6
  it('stops loading and navigates to the protected area when login succeeds', () => {
    authService.login.mockReturnValue(of(undefined));
    setUsername('ana');
    setPassword('secret123');
    fixture.detectChanges();

    component.onSubmit();

    expect(component.loading()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  // REQ-5.7
  it('shows a generic accessible error on invalid credentials and does not navigate', () => {
    authService.login.mockReturnValue(
      throwError(() => new Error('Usuario o contraseña incorrectos')),
    );
    setUsername('ana');
    setPassword('wrong');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('Usuario o contraseña incorrectos');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(alertTexts().some((text) => text.includes('Usuario o contraseña incorrectos'))).toBe(
      true,
    );
  });

  // REQ-5.8
  it('shows a network error message and does not navigate', () => {
    authService.login.mockReturnValue(
      throwError(() => new Error('No se pudo conectar. Intentá de nuevo.')),
    );
    setUsername('ana');
    setPassword('secret123');
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('No se pudo conectar. Intentá de nuevo.');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(
      alertTexts().some((text) => text.includes('No se pudo conectar. Intentá de nuevo.')),
    ).toBe(true);
  });

  // REQ-5.9
  it('does not trigger a second login call on a repeated submit while loading', () => {
    authService.login.mockReturnValue(new Subject());
    setUsername('ana');
    setPassword('secret123');
    fixture.detectChanges();

    component.onSubmit();
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledTimes(1);
  });
});
