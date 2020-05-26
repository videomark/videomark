all: sodium.js videomark-log-view

sodium.js:
	npm run build --prefix ../sodium.js
	rm -rf sodium.js
	cp ../sodium.js/dist/sodium.js .

videomark-log-view:
	npm run build --prefix ../videomark-log-view
	rm -rf qoelog
	cp -r ../videomark-log-view/build qoelog

npm-install:
	npm ci --prefix ../sodium.js
	npm ci --prefix ../videomark-log-view

.PHONY: all sodium.js videomark-log-view npm-install
