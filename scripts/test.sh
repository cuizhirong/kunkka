#!/bin/bash

export NODE_PATH=$NODE_PATH':server:drivers:.'
./node_modules/.bin/istanbul cover \
./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=tests/server_tests/jasmine.json 
node ./scripts/client_test.js \
&& ./node_modules/.bin/jest