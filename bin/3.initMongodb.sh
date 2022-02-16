#!/bin/bash
mkdir /home/tova/mongodb #/data/mongodb
docker pull mongo
iptables -I INPUT 1 -i eth0 -p tcp --dport 27017 -j ACCEPT
