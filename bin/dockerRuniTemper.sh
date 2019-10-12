#!/bin/bash
docker run --name iTemper -d -p 3000:3000 --mount type=bind,source=/home/tova/dist/.env,target=/usr/src/app/.env itemper-node:v$1

