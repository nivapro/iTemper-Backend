#!/bin/bash
# create partition /data
sudo apt update & apt install parted
sudo parted /dev/sdb mklabel msdos
sudo parted -a optimal /dev/sdb mkpart primary 0% 100%
sudo mkfs.ext4  /dev/sdb
sudo mkdir /data 
sudo mount /dev/sdb /data