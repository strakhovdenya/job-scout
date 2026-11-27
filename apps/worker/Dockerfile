# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/worker/Dockerfile -t job-scout-worker .
ARG NODE_IMAGE=node:24.22.3-trixie-slim

FROM ${NODE_IMAGE} AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable pnpm
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY packages/firestore/package.json packages/firestore/
COPY apps/worker/package.json apps/worker/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir=/pnpm-store --filter "@job-scout/worker..."
COPY packages/core packages/core
COPY packages/firestore packages/firestore
COPY apps/worker apps/worker
RUN pnpm --filter "@job-scout/worker..." run build
# Self-contained production directory: compiled worker plus production dependencies only.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm --filter @job-scout/worker deploy --prod --store-dir=/pnpm-store /out

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    JOBSCOUT_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
# Bounded Cloud Run Job: no listening port; the process exits when the run completes.
CMD ["node", "dist/main.js"]
