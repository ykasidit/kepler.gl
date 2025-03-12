FROM node:18.18.2-alpine

WORKDIR /app
ENV PUBLIC_URL=/maps

# Download release
RUN apk add --no-cache curl bash openssl
RUN apk add --no-cache g++ make libc-dev libxi-dev mesa-dev glew-dev pkgconfig python3 mesa-utils xvfb mesa-gl git
RUN apk add --no-cache xdg-utils
RUN git clone --depth=1 https://github.com/keplergl/kepler.gl.git .

RUN yarn set version 4.4.0
RUN yarn install
RUN yarn bootstrap

WORKDIR /app/examples/demo-app

RUN yarn install
# Expose port
EXPOSE 8080

RUN cp ../../.env.template /app/examples/demo-app/.env

# Modify package.json to set Webpack dev server to serve from /maps
RUN sed -i 's|"start:local": "react-scripts start"|"start:local": "react-scripts start --homepage /maps/"|' package.json

# Start the kepler.gl demo app with environment variables from host
CMD ["yarn", "start:local"]