FROM node:22-bookworm AS builder
WORKDIR /app
RUN apt-get update ; apt-get install -y build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config
RUN corepack enable
COPY . .
RUN yarn install
WORKDIR /app/examples/demo-app
RUN yarn install
RUN yarn build


FROM joseluisq/static-web-server:2-alpine
COPY --from=builder /app/examples/demo-app/dist/ /public/
ENV SERVER_CACHE_CONTROL_HEADERS=false
ENV SERVER_HOST 0.0.0.0
ENV SERVER_PORT 8080
ENV SERVER_ROOT=/public
