all: clean sodium.js videomark-log-view

clean:
	rm -rf sodium.js
	rm -rf qoelog

sodium.js:
	cd ../sodium.js && npm run build
	cp ../sodium.js/dist/sodium.js $(CURDIR)

videomark-log-view:
	cd ../videomark-log-view && npm run build
	cp -r ../videomark-log-view/build $(CURDIR)/qoelog

npm-install:
	cd ../sodium.js          && npm install --no-save
	cd ../videomark-log-view && npm install --no-save

.PHONY: all clean sodium.js videomark-log-view npm-install
