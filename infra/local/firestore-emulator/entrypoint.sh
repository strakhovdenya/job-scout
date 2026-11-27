#!/bin/sh
# Starts the Firestore Emulator and Emulator UI for a synthetic demo project.
# Set EMULATOR_PERSIST=true to import data on start and export it on graceful shutdown.
set -eu

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-demo-job-scout}"
case "$PROJECT_ID" in
  demo-*) ;;
  *) echo "Refusing to start: project id must start with demo- (got: $PROJECT_ID)" >&2; exit 1 ;;
esac

DATA_DIR=/home/node/emulator/data
set -- emulators:start --only firestore,ui --project "$PROJECT_ID"
if [ "${EMULATOR_PERSIST:-false}" = "true" ]; then
  if [ -f "$DATA_DIR/firebase-export-metadata.json" ]; then
    set -- "$@" --import "$DATA_DIR"
  fi
  set -- "$@" --export-on-exit "$DATA_DIR"
fi

exec firebase "$@"
