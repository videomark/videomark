#!/bin/sh
npm run build

rm build/asset-manifest.json
rm build/precache-manifest.*.js
rm build/service-worker.js
rm build/favicon.png
rm build/unsupported.html

rm build/static/css/*.map
rm build/static/js/*.map
rm build/static/js/*.LICENSE
