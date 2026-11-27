import { serviceHealthSchema } from '@job-scout/core';
import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/health', () => {
  it('returns an uncached JSON liveness payload without external dependencies', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = serviceHealthSchema.parse(await response.json());
    expect(body).toMatchObject({ status: 'ok', service: 'web' });
  });
});
