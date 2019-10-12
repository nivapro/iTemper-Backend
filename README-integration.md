# Servers 
1. itemper.vading.lan
2. vs.vading.lan

## itemper
ssh tova@itemper
## vs.vading.lan
vading\administrator

#Software
#Build and release
npm build
npm release

##deploy preparations
tar -czvf bin.tar.gz bin
scp bin tova@temper:
ssh tova@itemper
tar -xzf bin.tar.gz
$PATH=/home/tova/bin:$PATH
initDebian.sh
initKeys.sh
initMongodb.sh

##Deploy a back-end release
scp release/iTemperNode_<version>.tar.gz tova@iTemper:
deploy.sh <version>
