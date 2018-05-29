#!/bin/bash

cd $(dirname $0)

node ./merge_assets.js

cd ../client/uskin && npm run release

cd ..

grunt clean

export language=zh-CN
node ../scripts/client_i18n_build.js && grunt js

export language=en
node ../scripts/client_i18n_build.js && grunt js

grunt rest
