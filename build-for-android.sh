#!/bin/sh
yarn build

rm build/_headers
rm build/asset-manifest.json
rm build/manifest.json
rm build/precache-manifest.*.js
rm build/service-worker.js
rm build/favicon.png
rm build/unsupported.html

rm build/static/css/*.map
rm build/static/js/*.map
rm build/static/js/runtime~main.js
