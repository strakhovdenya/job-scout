#!/bin/sh
# Verify the compiled Worker with a disposable emulator on a network without external routing.
set -eu
worker_image=${1:-job-scout-worker:local}
emulator_image=${2:-job-scout-firestore-emulator:local}
network=$(docker network create --internal --label app=job-scout worker-smoke-$$)
emulator=''
cleanup() {
  if [ -n "$emulator" ]; then docker rm -f "$emulator" >/dev/null; fi
  docker network rm "$network" >/dev/null
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
emulator=$(docker run --detach --network "$network" --network-alias firestore \
  -e GOOGLE_CLOUD_PROJECT=demo-job-scout-smoke "$emulator_image")
attempt=0
until docker exec "$emulator" curl --fail --silent http://127.0.0.1:8080/ >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    docker logs "$emulator"
    exit 1
  fi
  sleep 1
done
docker run --rm --network "$network" \
  -e JOBSCOUT_ENV=test -e JOBSCOUT_PROVIDER_MODE=offline \
  -e METADATA_SERVER_DETECTION=none \
  -e GOOGLE_CLOUD_PROJECT=demo-job-scout-smoke -e FIRESTORE_EMULATOR_HOST=firestore:8080 \
  "$worker_image"
