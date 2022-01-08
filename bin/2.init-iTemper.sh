#!/bin/bash

apt-get update
apt-get install \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
     software-properties-common

curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | apt-key add -

# Docker
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
   $(lsb_release -cs) \
   stable"
apt-get update
apt-get install docker-ce

# Docker-compose
curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# New Access Token might be needed to pull iTemper from dockerhub
# Login to tova/torbjorn.vading@gmail.com at Dockerhub Create access token at docker hub: https://hub.docker.com/settings/security
# See Docker Access Token in enpass
echo <Access Token> > ~/.docker-pwd.txt
cat  ~/.docker-pwd.txt | docker login --username tova --password-stdin

# Might be need to configure a credential helper to 

# Manage Docker as a non-root user
sudo groupadd docker # Might exist already
sudo usermod -aG docker $USER
# Logout AND login again so that your group membership is re-evaluated.
# Verify that you can run docker commands without sudo.
# docker run hello-world

#Folder for tenants data
mkdir ~/tenants