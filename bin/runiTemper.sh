#!/bin/bash
docker stop iTemper
docker rename iTemper iTemper_pre_v$1
docker run --name iTemper -d -p 3000:3000 \
--mount type=bind,source=/home/tova/dist/.env,target=/usr/src/app/.env \
-v /home/tova/tenants:/usr/src/app/uploads \
itemper-node:v$1

