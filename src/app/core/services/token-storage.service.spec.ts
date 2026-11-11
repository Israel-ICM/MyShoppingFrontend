import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // REQ-1.1
  it('returns null for access and refresh when storage is empty', () => {
    expect(service.getAccess()).toBeNull();
    expect(service.getRefresh()).toBeNull();
  });

  // REQ-1.2
  it('returns the saved access and refresh tokens after set()', () => {
    service.set('access-123', 'refresh-456');

    expect(service.getAccess()).toBe('access-123');
    expect(service.getRefresh()).toBe('refresh-456');
  });

  // REQ-1.3
  it('clears both access and refresh tokens on clear()', () => {
    service.set('access-123', 'refresh-456');

    service.clear();

    expect(service.getAccess()).toBeNull();
    expect(service.getRefresh()).toBeNull();
  });

  // REQ-1.4
  it('updates only the access token via setAccess(), leaving refresh untouched', () => {
    service.set('access-123', 'refresh-456');

    service.setAccess('access-789');

    expect(service.getAccess()).toBe('access-789');
    expect(service.getRefresh()).toBe('refresh-456');
  });

  // REQ-1.5
  it('does not throw and returns null when the underlying storage read fails', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('corrupt storage access');
    });

    expect(() => service.getAccess()).not.toThrow();
    expect(service.getAccess()).toBeNull();

    getItemSpy.mockRestore();
  });
});
