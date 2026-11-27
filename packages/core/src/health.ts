import { z } from 'zod';

export const serviceNameSchema = z.enum(['web', 'worker']);
export type ServiceName = z.infer<typeof serviceNameSchema>;

export const serviceHealthSchema = z.object({
  status: z.literal('ok'),
  service: serviceNameSchema,
  timestamp: z.iso.datetime(),
});
export type ServiceHealth = z.infer<typeof serviceHealthSchema>;

/** Liveness payload. It intentionally checks no external dependencies. */
export function createServiceHealth(service: ServiceName, now: Date): ServiceHealth {
  return serviceHealthSchema.parse({ status: 'ok', service, timestamp: now.toISOString() });
}
