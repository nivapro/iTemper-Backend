#!/bin/bash
mkdir keys
cd keys
openssl ecparam -genkey -name prime256v1 -out ec-prime256v1-private-key.pem
openssl pkey -pubout -in ec-prime256v1-private-key.pem > ec-prime256v1-public-key.pem

