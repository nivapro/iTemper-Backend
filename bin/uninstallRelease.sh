#!/bin/bash
docker stop iTemper 
rm -r  /home/tova/dist
rm /home/tova/Dockerfile
rm /home/tova/docker-compose.yml
rm /home/tova/LICENSE
rm /home/tova/package.json
rm /home/tova/README.md
docker rmi itemper-node:v$1

