#!/bin/bash
docker pull rabbitmq
iptables -I INPUT 1 -i eth0 -p tcp --dport 5672 -j ACCEPT
