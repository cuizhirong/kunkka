#!/bin/bash
cd $(dirname $0)

export NODE_PATH='../../../../server:../../../../'
node ./initDatabase.js
