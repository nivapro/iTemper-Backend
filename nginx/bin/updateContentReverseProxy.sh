#!/bin/bash
docker run --rm --volume /home/tova/iTemper-Backend/nginx:/itemper --volumes-from itemper-nginx debian cp /itemper/content/* /usr/share/nginx/html
docker-compose -f docker-compose-production.yml exec webserver ls -la  /usr/share/nginx/html
