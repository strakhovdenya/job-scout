import { z } from 'zod';

export const APP_ENVIRONMENTS = ['local', 'test', 'production'] as const;
export const appEnvironmentSchema = z.enum(APP_ENVIRONMENTS);
export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;

/**
 * offline: synthetic fixtures, local Firestore, mock AI, no external calls (default outside production).
 * live_sources: permitted vacancy APIs, local Firestore, mock AI.
 * live_integration: permitted vacancy APIs and explicitly enabled AI providers with bounded budgets.
 */
export const PROVIDER_MODES = ['offline', 'live_sources', 'live_integration'] as const;
export const providerModeSchema = z.enum(PROVIDER_MODES);
export type ProviderMode = z.infer<typeof providerModeSchema>;

/** Firebase "demo-" projects can never reach real Google Cloud resources. */
export const DEMO_PROJECT_PREFIX = 'demo-';

const optionalText = z.string().trim().min(1).optional();
const positiveIntText = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/, 'must be a positive integer')
  .transform(Number)
  .optional();

const rawRuntimeEnvSchema = z.object({
  JOBSCOUT_ENV: appEnvironmentSchema,
  JOBSCOUT_PROVIDER_MODE: providerModeSchema.optional(),
  JOBSCOUT_MOCK_AUTH: z.enum(['true', 'false']).optional(),
  GOOGLE_CLOUD_PROJECT: optionalText,
  FIRESTORE_EMULATOR_HOST: optionalText,
  JOBSCOUT_AI_MAX_REQUESTS_PER_RUN: positiveIntText,
  JOBSCOUT_AI_MAX_TOKENS_PER_RUN: positiveIntText,
});

export type FirestoreTarget =
  { readonly mode: 'emulator'; readonly emulatorHost: string } | { readonly mode: 'cloud' };

export interface AiBudget {
  readonly maxRequestsPerRun: number;
  readonly maxTokensPerRun: number;
}

export interface RuntimeConfig {
  readonly environment: AppEnvironment;
  readonly providerMode: ProviderMode;
  readonly mockAuth: boolean;
  readonly googleCloudProject: string;
  readonly firestore: FirestoreTarget;
  /** Present only when real AI providers are enabled (`live_integration`). */
  readonly aiBudget: AiBudget | null;
}

export class RuntimeConfigError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid runtime configuration:\n- ${issues.join('\n- ')}`);
    this.name = 'RuntimeConfigError';
    this.issues = issues;
  }
}

const HOST_PORT_PATTERN = /^[A-Za-z0-9.-]+:\d{1,5}$|^\[[0-9A-Fa-f:]+\]:\d{1,5}$/;

/**
 * Parses and validates runtime configuration. Fails closed:
 * - local/test require the Firestore emulator and a `demo-` project;
 * - production rejects emulator settings, mock authentication and non-live provider modes.
 */
export function loadRuntimeConfig(
  env: Readonly<Record<string, string | undefined>>,
): RuntimeConfig {
  const parsed = rawRuntimeEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new RuntimeConfigError(
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }
  const raw = parsed.data;
  const issues: string[] = [];
  const isProduction = raw.JOBSCOUT_ENV === 'production';
  const providerMode =
    raw.JOBSCOUT_PROVIDER_MODE ?? (isProduction ? 'live_integration' : 'offline');
  const mockAuth = raw.JOBSCOUT_MOCK_AUTH === 'true';
  const project = raw.GOOGLE_CLOUD_PROJECT;
  const emulatorHost = raw.FIRESTORE_EMULATOR_HOST;

  if (project === undefined) {
    issues.push('GOOGLE_CLOUD_PROJECT is required.');
  }

  if (isProduction) {
    if (emulatorHost !== undefined) {
      issues.push('FIRESTORE_EMULATOR_HOST must not be set in production.');
    }
    if (mockAuth) {
      issues.push('JOBSCOUT_MOCK_AUTH must not be enabled in production.');
    }
    if (providerMode !== 'live_integration') {
      issues.push(
        'Production requires JOBSCOUT_PROVIDER_MODE=live_integration (mock providers are local-only).',
      );
    }
    if (project?.startsWith(DEMO_PROJECT_PREFIX) === true) {
      issues.push(`Production must not use a "${DEMO_PROJECT_PREFIX}" emulator project.`);
    }
  } else {
    if (emulatorHost === undefined) {
      issues.push(`FIRESTORE_EMULATOR_HOST is required in the ${raw.JOBSCOUT_ENV} environment.`);
    } else if (!HOST_PORT_PATTERN.test(emulatorHost)) {
      issues.push('FIRESTORE_EMULATOR_HOST must have the form host:port.');
    }
    if (project !== undefined && !project.startsWith(DEMO_PROJECT_PREFIX)) {
      issues.push(
        `GOOGLE_CLOUD_PROJECT must start with "${DEMO_PROJECT_PREFIX}" in the ${raw.JOBSCOUT_ENV} environment.`,
      );
    }
  }

  let aiBudget: AiBudget | null = null;
  if (providerMode === 'live_integration') {
    const maxRequestsPerRun = raw.JOBSCOUT_AI_MAX_REQUESTS_PER_RUN;
    const maxTokensPerRun = raw.JOBSCOUT_AI_MAX_TOKENS_PER_RUN;
    if (maxRequestsPerRun === undefined || maxTokensPerRun === undefined) {
      issues.push(
        'live_integration requires JOBSCOUT_AI_MAX_REQUESTS_PER_RUN and JOBSCOUT_AI_MAX_TOKENS_PER_RUN.',
      );
    } else {
      aiBudget = { maxRequestsPerRun, maxTokensPerRun };
    }
  }

  if (issues.length > 0 || project === undefined) {
    throw new RuntimeConfigError(issues);
  }

  return {
    environment: raw.JOBSCOUT_ENV,
    providerMode,
    mockAuth,
    googleCloudProject: project,
    firestore: emulatorHost === undefined ? { mode: 'cloud' } : { mode: 'emulator', emulatorHost },
    aiBudget,
  };
}
