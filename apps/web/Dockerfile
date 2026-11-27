# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/web/Dockerfile -t job-scout-web .
ARG NODE_IMAGE=node:24.22.3-trixie-slim

FROM ${NODE_IMAGE} AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir=/pnpm-store --filter "@job-scout/web..."
COPY packages/core packages/core
COPY apps/web apps/web
RUN pnpm --filter "@job-scout/web..." run build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=8080 \
    JOBSCOUT_ENV=production
WORKDIR /app
# Standalone output mirrors the monorepo layout because tracing starts at the repository root.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
