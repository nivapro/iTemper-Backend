#!/bin/bash 
cat  ~/.docker-pwd.txt | docker login --username tova --password-stdin
docker pull tova/itemper:latest
