import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Única puerta de entrada a localStorage para los tokens de auth.
 * Ningún otro módulo debe leer/escribir estas claves directamente.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccess(): string | null {
    return this.readKey(ACCESS_TOKEN_KEY);
  }

  getRefresh(): string | null {
    return this.readKey(REFRESH_TOKEN_KEY);
  }

  set(access: string, refresh: string): void {
    this.writeKey(ACCESS_TOKEN_KEY, access);
    this.writeKey(REFRESH_TOKEN_KEY, refresh);
  }

  setAccess(access: string): void {
    this.writeKey(ACCESS_TOKEN_KEY, access);
  }

  clear(): void {
    this.removeKey(ACCESS_TOKEN_KEY);
    this.removeKey(REFRESH_TOKEN_KEY);
  }

  private readKey(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeKey(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage no disponible o lleno: se ignora, la sesión en memoria sigue viva.
    }
  }

  private removeKey(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage no disponible: no hay nada que limpiar.
    }
  }
}
