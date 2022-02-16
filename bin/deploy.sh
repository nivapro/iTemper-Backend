#!/bin/bash
docker stop iTemper 
rm -r  /home/tova/dist
rm /home/tova/Dockerfile
rm /home/tova/docker-compose.yml
rm /home/tova/LICENSE
rm /home/tova/package.json
rm /home/tova/README.md
initRelease.sh $1
dockerBuild.sh $1
runiTemper.sh $1
