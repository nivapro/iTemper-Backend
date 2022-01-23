#!/bin/bash
docker-compose -f docker-compose-production.yml kill -s HUP webserver
