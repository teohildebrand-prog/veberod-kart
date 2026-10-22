#!/usr/bin/env bash
# Start the local Jenkins on http://localhost:${JENKINS_PORT:-8080}/ with the veberod-kart job ready.
#   tools/jenkins/start.sh          build and start (first run: a few minutes for the plugins)
#   tools/jenkins/start.sh stop     stop it (jobs and build history are kept in a Docker volume)
#   tools/jenkins/start.sh logs     follow Jenkins' log
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-start}" in
  stop) exec docker compose down ;;
  logs) exec docker compose logs -f ;;
esac
if [ ! -f .env ]; then
  echo "JENKINS_ADMIN_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(12))')" > .env
fi
docker compose up -d --build
url="http://localhost:${JENKINS_PORT:-8080}/"
printf 'waiting for Jenkins'
for _ in $(seq 1 120); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "${url}login" || true)
  [ "$code" = 200 ] && break
  printf '.'; sleep 2
done
echo
echo "Jenkins: ${url}job/veberod-kart/  (user admin, password in tools/jenkins/.env)"
echo "Build Now runs the whole Jenkinsfile; main is also polled every 5 minutes."
