# base-image for node on any machine using a template variable,
# see more about dockerfile templates here: http://docs.resin.io/deployment/docker-templates/
# and about resin base images here: http://docs.resin.io/runtime/resin-base-images/
# Note the node:slim image doesn't have node-gyp
FROM node:latest

RUN apt-get update && apt-get install -yq \
    && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json
COPY README.md README.md 

RUN npm install --production 

# This will copy all files in our root to the working  directory in the container
COPY ./dist ./dist

# Enable systemd init system in container
ENV INITSYSTEM on

EXPOSE 80

USER node
# server.js will run when container starts up on the device
CMD ["npm", "start"]
