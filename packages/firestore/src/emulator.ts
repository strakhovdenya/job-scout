import { DEMO_PROJECT_PREFIX, type RuntimeConfig } from '@job-scout/core';

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export interface LocalEmulatorTarget {
  readonly projectId: string;
  readonly baseUrl: URL;
}

/**
 * Guards destructive and seeding operations. They may only target a Firestore emulator on a
 * loopback address, with a `demo-` project, in the local or test environment.
 */
export function assertLocalEmulatorTarget(config: RuntimeConfig): LocalEmulatorTarget {
  if (config.environment === 'production') {
    throw new Error('Refusing to modify data: the production environment is never an emulator.');
  }
  if (config.firestore.mode !== 'emulator') {
    throw new Error('Refusing to modify data: Firestore is not configured for the emulator.');
  }
  if (!config.googleCloudProject.startsWith(DEMO_PROJECT_PREFIX)) {
    throw new Error(`Refusing to modify data: project must start with "${DEMO_PROJECT_PREFIX}".`);
  }
  const baseUrl = new URL(`http://${config.firestore.emulatorHost}`);
  if (!LOOPBACK_HOSTNAMES.has(baseUrl.hostname)) {
    throw new Error(
      `Refusing to modify data: emulator host "${baseUrl.hostname}" is not a loopback address.`,
    );
  }
  return { projectId: config.googleCloudProject, baseUrl };
}

type FetchFn = (input: URL, init?: RequestInit) => Promise<Response>;

/** Verifies the endpoint answers like the Firestore emulator (its root responds with "Ok"). */
export async function probeEmulator(target: LocalEmulatorTarget, fetchFn: FetchFn = fetch) {
  const response = await fetchFn(target.baseUrl, { signal: AbortSignal.timeout(5_000) });
  const body = (await response.text()).trim();
  if (!response.ok || body !== 'Ok') {
    throw new Error(`Endpoint ${target.baseUrl.href} did not respond like a Firestore emulator.`);
  }
}

/** Deletes every document of the project's default database using the emulator-only API. */
export async function resetEmulatorDatabase(
  config: RuntimeConfig,
  fetchFn: FetchFn = fetch,
): Promise<void> {
  const target = assertLocalEmulatorTarget(config);
  await probeEmulator(target, fetchFn);
  const url = new URL(
    `/emulator/v1/projects/${encodeURIComponent(target.projectId)}/databases/(default)/documents`,
    target.baseUrl,
  );
  const response = await fetchFn(url, { method: 'DELETE', signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Emulator reset failed with HTTP ${response.status}.`);
  }
}
