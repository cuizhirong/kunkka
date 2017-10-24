#!/bin/bash

cd $(dirname $0)

./client_build.sh
node ./merge_config.js
node ./server_i18n_build.js
