#!/bin/bash
node scripts/preStartCheck.js \
&& pm2 start pm2.json
