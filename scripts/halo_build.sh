#!/bin/bash

cd $(dirname $0)

./client_build.sh

node ./server_i18n_build.js
