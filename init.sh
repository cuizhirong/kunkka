#!/bin/bash

git submodule init
git submodule update
cp package.json.sample package.json
cp config.json.sample config.json
node ./scripts/merge_config.js
npm run merge
npm install --unsafe-perm
npm run build --production true
