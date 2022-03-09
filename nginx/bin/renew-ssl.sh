#!/bin/bash

COMPOSE="/usr/bin/docker-compose --no-ansi"
DOCKER="/usr/bin/docker"

cd /home/tova/iTemper-Backend/nginx
$COMPOSE -f docker-compose-production.yml run cerbot renew --dry-run && $COMPOSE kill -s SIGHUP webserver
$DOCKER system prune -af
