#!/bin/bash

export NODE_PATH=$NODE_PATH':server:drivers:.'
export NODE_ENV=production
#pm2 start index.js --watch
node index.js