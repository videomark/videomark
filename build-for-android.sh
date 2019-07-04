#!/bin/sh
npm run build

rm build/asset-manifest.json
rm build/manifest.json
rm build/precache-manifest.*.js
rm build/service-worker.js
rm build/favicon.png

rm build/static/css/*.map
rm build/static/js/*.map
