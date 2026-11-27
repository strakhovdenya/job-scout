/**
 * Runs once when the Next.js server starts. Validates runtime configuration so that the
 * server refuses to start with unsafe settings (for example, emulator settings in production).
 */
export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME !== 'nodejs' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    return;
  }
  const { validateRuntimeConfigOrExit } = await import('./server/runtime-config');
  validateRuntimeConfigOrExit();
}
