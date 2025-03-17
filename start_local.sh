#!/bin/bash
set -e
cd examples/demo-app
cp ../../.env.template .env
echo "### starting yarn local"
yarn start:local
