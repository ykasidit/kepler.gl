FROM node:22-bookworm AS builder
WORKDIR /app
RUN apt-get update ; apt-get install -y build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config
RUN corepack enable
RUN curl https://get.volta.sh | bash
COPY . .
RUN yarn install
WORKDIR /app/examples/demo-app
RUN yarn install
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/examples/demo-app/dist/ /usr/share/nginx/html/
EXPOSE 80