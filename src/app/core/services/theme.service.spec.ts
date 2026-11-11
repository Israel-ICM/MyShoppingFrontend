import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  function create(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  function mockPrefersDark(matches: boolean): void {
    window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
  }

  it('defaults to light when there is no stored preference and the system has none', () => {
    mockPrefersDark(false);

    const service = create();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('follows the system preference when there is no stored override', () => {
    mockPrefersDark(true);

    const service = create();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('reads a stored preference and forces the attribute even against system preference', () => {
    localStorage.setItem('myshopping-theme', 'dark');
    mockPrefersDark(false);

    const service = create();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle() flips the theme, persists it and sets the attribute', () => {
    mockPrefersDark(false);
    const service = create();

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('myshopping-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('myshopping-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
