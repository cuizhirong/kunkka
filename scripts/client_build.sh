#!/bin/bash

cd $(dirname $0)

node ./build_client_config.js
node ./merge_assets.js

cd ../client/uskin && npm run release

cd ..

grunt clean

node ../scripts/client_i18n_build.js && npm run language_build && grunt js

grunt rest
