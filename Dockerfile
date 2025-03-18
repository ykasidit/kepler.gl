FROM node:22-bookworm AS builder
WORKDIR /app
RUN apt-get update ; apt-get install -y build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config
RUN corepack enable
COPY . .
RUN cp .env.template .env
RUN cp .env.template /app/examples/demo-app/.env
RUN yarn install
WORKDIR /app/examples/demo-app
RUN yarn install
CMD ["yarn", "start:local"]
