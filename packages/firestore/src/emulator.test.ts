import type { RuntimeConfig } from '@job-scout/core';
import { describe, expect, it } from 'vitest';
import { assertLocalEmulatorTarget, resetEmulatorDatabase } from './emulator.ts';

const localConfig: RuntimeConfig = {
  environment: 'local',
  providerMode: 'offline',
  mockAuth: false,
  googleCloudProject: 'demo-job-scout',
  firestore: { mode: 'emulator', emulatorHost: '127.0.0.1:8080' },
  aiBudget: null,
};

interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly redirect: RequestInit['redirect'];
}

function fakeFetch(rootBody: string, requests: RecordedRequest[]) {
  return (input: URL, init?: RequestInit): Promise<Response> => {
    requests.push({ url: input.href, method: init?.method ?? 'GET', redirect: init?.redirect });
    return Promise.resolve(new Response(init?.method === 'DELETE' ? '{}' : rootBody));
  };
}

describe('assertLocalEmulatorTarget', () => {
  it('accepts a loopback emulator with a demo project', () => {
    expect(assertLocalEmulatorTarget(localConfig).baseUrl.href).toBe('http://127.0.0.1:8080/');
  });

  it.each([
    ['production', { ...localConfig, environment: 'production' as const }],
    ['cloud Firestore', { ...localConfig, firestore: { mode: 'cloud' as const } }],
    ['non-demo project', { ...localConfig, googleCloudProject: 'job-scout-prod' }],
    [
      'non-loopback host',
      { ...localConfig, firestore: { mode: 'emulator' as const, emulatorHost: '10.0.0.5:8080' } },
    ],
  ])('refuses %s', (_label, config) => {
    expect(() => assertLocalEmulatorTarget(config)).toThrow(/Refusing to modify data/);
  });
});

describe('resetEmulatorDatabase', () => {
  it('probes and deletes only at emulator endpoints and refuses redirects on both requests', async () => {
    const requests: RecordedRequest[] = [];
    await resetEmulatorDatabase(localConfig, fakeFetch('Ok\n', requests));
    expect(requests).toEqual([
      { url: 'http://127.0.0.1:8080/', method: 'GET', redirect: 'error' },
      {
        url: 'http://127.0.0.1:8080/emulator/v1/projects/demo-job-scout/databases/(default)/documents',
        method: 'DELETE',
        redirect: 'error',
      },
    ]);
  });

  it('does not delete anything when the endpoint is not an emulator', async () => {
    const requests: RecordedRequest[] = [];
    await expect(
      resetEmulatorDatabase(localConfig, fakeFetch('<html>dev server</html>', requests)),
    ).rejects.toThrow(/did not respond like a Firestore emulator/);
    expect(requests.map((request) => request.method)).toEqual(['GET']);
  });
});
