#!/bin/bash

sudo iptables -I INPUT 1 -i eth0 -p tcp --dport 443 -j ACCEPT
sudo  iptables -I INPUT 1 -i eth0 -p tcp --dport 80 -j ACCEPT
