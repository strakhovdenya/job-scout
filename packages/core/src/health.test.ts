import { describe, expect, it } from 'vitest';
import { createServiceHealth, serviceHealthSchema } from './health.ts';

describe('createServiceHealth', () => {
  it('builds a schema-valid liveness payload from the injected clock', () => {
    const health = createServiceHealth('web', new Date('2026-01-02T03:04:05.000Z'));
    expect(health).toEqual({ status: 'ok', service: 'web', timestamp: '2026-01-02T03:04:05.000Z' });
    expect(serviceHealthSchema.safeParse(health).success).toBe(true);
  });
});
