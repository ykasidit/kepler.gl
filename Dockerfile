FROM node:20-alpine
WORKDIR /kepler.gl
COPY . .
WORKDIR /kepler.gl/examples/demo-app

# credit to: https://github.com/khadkakrishna/kepler-gl-docker/blob/main/Dockerfile
RUN npm install npm -g
RUN npm install --legacy-peer-deps --save kepler.gl
# npm start needs to be replaced in package.json with following command to make it work on docker
RUN sed -i '3s/.*/    "start": "export SET NODE_OPTIONS=--openssl-legacy-provider \&\& webpack-dev-server --mode development --progress --hot --open --port 8080 --host 0.0.0.0",/' package.json

CMD ["npm", "start"]
EXPOSE 8080