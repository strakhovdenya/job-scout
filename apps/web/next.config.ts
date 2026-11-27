import path from 'node:path';
import type { NextConfig } from 'next';

const workspaceRoot = path.join(import.meta.dirname, '../..');

const nextConfig: NextConfig = {
  // Self-contained server output for the Cloud Run container image.
  output: 'standalone',
  // Trace dependencies from the monorepo root so workspace packages are included.
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  poweredByHeader: false,
  // JobScout owns its repository instructions. Keep next dev from generating agent files.
  agentRules: false,
  reactStrictMode: true,
};

export default nextConfig;
