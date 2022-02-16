#!/bin/bash
docker run --rm --volume /home/tova/iTemper-Backend/nginx:/itemper --volumes-from itemper-nginx debian cp /itemper/config/conf.d/userapi.conf /etc/nginx/conf.d
docker-compose -f docker-compose-production.yml exec webserver ls -la /etc/nginx/conf.d
