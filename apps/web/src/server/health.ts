import { createServiceHealth, type ServiceHealth } from '@job-scout/core';

/** Liveness only: no database, cloud credentials, external APIs or AI providers. */
export function getWebHealth(now: Date = new Date()): ServiceHealth {
  return createServiceHealth('web', now);
}
