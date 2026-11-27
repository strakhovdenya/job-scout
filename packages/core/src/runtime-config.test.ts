import { describe, expect, it } from 'vitest';
import { loadRuntimeConfig, RuntimeConfigError } from './runtime-config.ts';

const local = {
  JOBSCOUT_ENV: 'local',
  GOOGLE_CLOUD_PROJECT: 'demo-job-scout',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
};

const production = {
  JOBSCOUT_ENV: 'production',
  GOOGLE_CLOUD_PROJECT: 'job-scout-prod',
  JOBSCOUT_AI_MAX_REQUESTS_PER_RUN: '50',
  JOBSCOUT_AI_MAX_TOKENS_PER_RUN: '200000',
};

function issuesOf(env: Record<string, string>): readonly string[] {
  try {
    loadRuntimeConfig(env);
  } catch (error: unknown) {
    if (error instanceof RuntimeConfigError) {
      return error.issues;
    }
    throw error;
  }
  throw new Error('Expected configuration to be rejected.');
}

describe('loadRuntimeConfig', () => {
  it('defaults local development to offline mode against the emulator', () => {
    expect(loadRuntimeConfig(local)).toEqual({
      environment: 'local',
      providerMode: 'offline',
      mockAuth: false,
      googleCloudProject: 'demo-job-scout',
      firestore: { mode: 'emulator', emulatorHost: '127.0.0.1:8080' },
      aiBudget: null,
    });
  });

  it('requires an explicit environment', () => {
    expect(issuesOf({ GOOGLE_CLOUD_PROJECT: 'demo-job-scout' })[0]).toMatch(/^JOBSCOUT_ENV/);
  });

  it('fails closed when local or test runs without the emulator', () => {
    const { FIRESTORE_EMULATOR_HOST: _omitted, ...withoutEmulator } = local;
    expect(issuesOf(withoutEmulator)).toContain(
      'FIRESTORE_EMULATOR_HOST is required in the local environment.',
    );
    expect(issuesOf({ ...withoutEmulator, JOBSCOUT_ENV: 'test' })).toContain(
      'FIRESTORE_EMULATOR_HOST is required in the test environment.',
    );
  });

  it('rejects non-demo projects outside production', () => {
    expect(issuesOf({ ...local, GOOGLE_CLOUD_PROJECT: 'job-scout-prod' })).toEqual([
      'GOOGLE_CLOUD_PROJECT must start with "demo-" in the local environment.',
    ]);
  });

  it('accepts a production configuration that targets Cloud Firestore', () => {
    expect(loadRuntimeConfig(production)).toMatchObject({
      environment: 'production',
      providerMode: 'live_integration',
      firestore: { mode: 'cloud' },
      aiBudget: { maxRequestsPerRun: 50, maxTokensPerRun: 200000 },
    });
  });

  it('refuses production startup with emulator, mock auth, mock providers or demo project', () => {
    const issues = issuesOf({
      ...production,
      GOOGLE_CLOUD_PROJECT: 'demo-job-scout',
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      JOBSCOUT_MOCK_AUTH: 'true',
      JOBSCOUT_PROVIDER_MODE: 'offline',
    });
    expect(issues).toHaveLength(4);
  });

  it('requires explicit AI budgets for live integration', () => {
    expect(issuesOf({ ...local, JOBSCOUT_PROVIDER_MODE: 'live_integration' })).toEqual([
      'live_integration requires JOBSCOUT_AI_MAX_REQUESTS_PER_RUN and JOBSCOUT_AI_MAX_TOKENS_PER_RUN.',
    ]);
  });

  it.each(['9007199254740992', '9'.repeat(400), '0', '1.5'])(
    'rejects an unsafe AI budget %s',
    (budget) => {
      expect(issuesOf({ ...production, JOBSCOUT_AI_MAX_REQUESTS_PER_RUN: budget })[0]).toContain(
        'JOBSCOUT_AI_MAX_REQUESTS_PER_RUN',
      );
    },
  );

  it.each(['localhost:0', 'localhost:65536', '[::]:00000'])(
    'rejects an invalid emulator address %s',
    (address) => {
      expect(issuesOf({ ...local, FIRESTORE_EMULATOR_HOST: address })[0]).toContain(
        'FIRESTORE_EMULATOR_HOST',
      );
    },
  );
});
