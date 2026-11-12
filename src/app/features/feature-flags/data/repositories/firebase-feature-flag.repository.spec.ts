import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { FirebaseFeatureFlagRepository } from './firebase-feature-flag.repository';

const mockInitializeApp = jest.fn();
const mockGetRemoteConfig = jest.fn();
const mockFetchAndActivate = jest.fn();
const mockGetValue = jest.fn();

jest.mock('firebase/app', () => ({
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args),
}));
jest.mock('firebase/remote-config', () => ({
  getRemoteConfig: (...args: unknown[]) => mockGetRemoteConfig(...args),
  fetchAndActivate: (...args: unknown[]) => mockFetchAndActivate(...args),
  getValue: (...args: unknown[]) => mockGetValue(...args),
}));
jest.mock('../../../../../environments/environment', () => ({
  environment: { production: false, firebase: { projectId: 'demo-project' } },
}));

describe('FirebaseFeatureFlagRepository', () => {
  let repo: FirebaseFeatureFlagRepository;
  let remoteConfig: { settings: { minimumFetchIntervalMillis: number }; defaultConfig: unknown };
  const env = environment as { production: boolean; firebase: { projectId: string } };

  beforeEach(() => {
    jest.clearAllMocks();
    env.production = false;
    env.firebase.projectId = 'demo-project';
    remoteConfig = { settings: { minimumFetchIntervalMillis: 0 }, defaultConfig: undefined };
    mockInitializeApp.mockReturnValue({ app: true });
    mockGetRemoteConfig.mockReturnValue(remoteConfig);
    mockFetchAndActivate.mockResolvedValue(true);
    mockGetValue.mockReturnValue({ asString: () => 'true' });
    TestBed.configureTestingModule({ providers: [FirebaseFeatureFlagRepository] });
    repo = TestBed.inject(FirebaseFeatureFlagRepository);
  });

  it('devuelve true sin llamar a Firebase si no hay projectId', async () => {
    env.firebase.projectId = '';
    await expect(repo.isCategoriesEnabled()).resolves.toBe(true);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('inicializa Remote Config con intervalo de desarrollo y default "true"', async () => {
    await repo.isCategoriesEnabled();
    expect(mockInitializeApp).toHaveBeenCalledWith(env.firebase);
    expect(mockGetRemoteConfig).toHaveBeenCalledWith({ app: true });
    expect(remoteConfig.settings.minimumFetchIntervalMillis).toBe(30000);
    expect(remoteConfig.defaultConfig).toEqual({ categories_enabled: 'true' });
    expect(mockFetchAndActivate).toHaveBeenCalledWith(remoteConfig);
    expect(mockGetValue).toHaveBeenCalledWith(remoteConfig, 'categories_enabled');
  });

  it('usa intervalo de 1 hora en producción', async () => {
    env.production = true;
    await repo.isCategoriesEnabled();
    expect(remoteConfig.settings.minimumFetchIntervalMillis).toBe(3600000);
  });

  it('devuelve true cuando el valor remoto es "true"', async () => {
    await expect(repo.isCategoriesEnabled()).resolves.toBe(true);
  });

  it('devuelve false cuando el valor remoto es "false"', async () => {
    mockGetValue.mockReturnValue({ asString: () => 'false' });
    await expect(repo.isCategoriesEnabled()).resolves.toBe(false);
  });

  it('propaga el error si fetchAndActivate falla (el use case aplica el fail-safe)', async () => {
    mockFetchAndActivate.mockRejectedValue(new Error('offline'));
    await expect(repo.isCategoriesEnabled()).rejects.toThrow('offline');
  });
});
