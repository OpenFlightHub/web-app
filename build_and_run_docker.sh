docker build -t web-app .

docker stop web-app || true

docker rm web-app || true


docker run --restart unless-stopped --name web-app -p 8080:80 -d web-app