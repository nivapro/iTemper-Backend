
docker build --tag=itemper .
rev=$(git rev-parse --short HEAD)
docker tag itemper tova/itemper:${rev}
docker tag itemper tova/itemper:latest
docker push tova/itemper:latest
docker push tova/itemper:${rev}