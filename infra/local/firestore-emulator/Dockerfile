# syntax=docker/dockerfile:1
# Local-only Firebase Local Emulator Suite image (Firestore Emulator + Emulator UI).
# Never deploy this image. It is built by compose.yaml.
ARG NODE_IMAGE=node:24.22.3-trixie-slim
ARG JAVA_IMAGE=eclipse-temurin:21.0.13_9-jre-noble

FROM ${JAVA_IMAGE} AS java

FROM ${NODE_IMAGE}
ARG FIREBASE_TOOLS_VERSION=15.37.0
ENV JAVA_HOME=/opt/java/openjdk \
    PATH=/opt/java/openjdk/bin:$PATH \
    FIREBASE_CLI_DISABLE_UPDATE_CHECK=true \
    NO_UPDATE_NOTIFIER=1
COPY --from=java /opt/java/openjdk /opt/java/openjdk
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && npm install --global --no-fund --no-audit "firebase-tools@${FIREBASE_TOOLS_VERSION}" \
 && npm cache clean --force
USER node
WORKDIR /home/node/emulator
# Download emulator binaries at build time so container start needs no network access.
RUN firebase setup:emulators:firestore && firebase setup:emulators:ui
COPY --chown=node:node firebase.json entrypoint.sh ./
RUN mkdir -p /home/node/emulator/data
ENTRYPOINT ["sh", "./entrypoint.sh"]
