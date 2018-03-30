tsc=node_modules/.bin/tsc
sources=$(wildcard src/*)

.PHONY: all watch test

all: build

node_modules: package.json
	npm install --deps

watch: node_modules
	node $(tsc) --watch

build: node_modules $(sources) tsconfig.json
	node $(tsc)

test:
	node node_modules/.bin/mocha --opts mocha.opts
