all: clean sodium.js videomark-log-view

clean:
	rm -rf sodium.js
	rm -rf qoelog

sodium.js:
	npm run build --prefix ../sodium.js
	cp ../sodium.js/dist/sodium.js .

videomark-log-view:
	npm run build --prefix ../videomark-log-view
	cp -r ../videomark-log-view/build qoelog

npm-install:
	npm ci --prefix ../sodium.js
	npm ci --prefix ../videomark-log-view

.PHONY: all clean sodium.js videomark-log-view npm-install
