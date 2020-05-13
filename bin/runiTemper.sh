#!/bin/bash
docker stop itemper
docker rm itemper
docker pull tova/itemper:latest
docker run --name itemper -d -p 3000:3000 \
--mount type=bind,source=/home/tova/.env,target=/usr/src/app/.env \
-v /home/tova/tenants:/usr/src/app/uploads \
tova/itemper:latest
