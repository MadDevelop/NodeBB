eval $(docker-machine env static)
docker build -t rspeer-forums .
docker stop $(docker ps | grep "./nodeb" | awk '{ print $1 }')
docker run -d -p 3004:3004 rspeer-forums
docker system prune -f

