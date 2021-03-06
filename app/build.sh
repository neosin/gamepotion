cd src;
  npm i;
  npm run build;
cd ..;

docker stop gamepotion-app;
docker rm gamepotion-app;
docker build -t gamepotion-app .;

docker tag gamepotion-app eu.gcr.io/thegmc-219013/gamepotion-app:latest;
docker push eu.gcr.io/thegmc-219013/gamepotion-app:latest;
