#!/bin/bash
docker run -d --hostname itemper.vading.lan --name itemper-rabbit -p 5672:5672 rabbitmq:3
