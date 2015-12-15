#!/bin/bash

export NODE_PATH=$NODE_PATH':server:drivers:.'
pm2 start index.js --watch
