#!/bin/bash
docker stop  my-nginx
docker rm  my-nginx
docker run --name my-nginx -p 80:80 -d \
  --mount type=bind,source=/home/tova/iTemper-Backend/nginx/content,target=/data/content  \
  --mount type=bind,source=/home/tova/iTemper-Backend/nginx/config,target=/data/config itemper-nginx
#  itemper-nginx
#  --mount type=bind,source=/data/cerbot,target=/var/www/certbot  \
#  --mount type=bind,source=/data/letsencrypt,target=/etc/letsencrypt  \
#  itemper-nginx

