#!/bin/bash
cd ~/iTemper-Backend/nginx/
docker pull tova/itemper-web
docker-compose -f docker-compose-production.yml up -d --force-recreate --no-deps itemper-web
