#!/bin/bash

git submodule init
git submodule update
cp package.json.sample package.json
cp config.json.sample config.json
mkdir client/applications
node ./scripts/merge_config.js
if [ $# -gt 0 ]
then
  if [ $1 = "production" ]
  then
    npm run assemble -- $1
  fi
else
  npm run assemble
fi
npm run merge
npm install --unsafe-perm
npm run build --production true