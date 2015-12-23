#!/bin/bash
node scripts/i18n_build.js
export NODE_PATH=$NODE_PATH':server:drivers:.'
pm2 start index.js --watch
