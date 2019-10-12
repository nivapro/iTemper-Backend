#!/bin/bash
mkdir /home/tova/mongodb
docker run --name mongodb -v /home/tova/mongodb:/data/db -d mongo
iptables -I INPUT 1 -i eth0 -p tcp --dport 27017 -j ACCEPT
