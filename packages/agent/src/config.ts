import { z } from 'zod';

/**
 * Model identifiers are configuration, never code constants: provider catalogs change
 * and identifiers must be verified against official provider documentation before use.
 */
const screeningModelConfigSchema = z.object({
  JOBSCOUT_SCREENING_MODEL: z
    .string({ error: 'JOBSCOUT_SCREENING_MODEL is required to run AI screening.' })
    .trim()
    .min(1, 'JOBSCOUT_SCREENING_MODEL must not be empty.'),
});

export interface ScreeningModelConfig {
  readonly modelId: string;
}

export function loadScreeningModelConfig(
  env: Readonly<Record<string, string | undefined>>,
): ScreeningModelConfig {
  const parsed = screeningModelConfigSchema.parse(env);
  return { modelId: parsed.JOBSCOUT_SCREENING_MODEL };
}
