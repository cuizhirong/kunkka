#!/bin/bash

cd $(dirname $0)

cd ../client/uskin && npm run release

cd ..

grunt clean

export language=zh-CN
node ../scripts/client_i18n_build.js && grunt js

export language=en
node ../scripts/client_i18n_build.js && grunt js

grunt usebanner
grunt copy
