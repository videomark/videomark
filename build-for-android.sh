#!/bin/sh
yarn build

rm build/_headers
rm build/asset-manifest.json
rm build/manifest.json

rm build/static/css/*.map
rm build/static/js/*.map
