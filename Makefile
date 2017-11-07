# just run the app from source code
start:
	npm start

release: GIT_HASH = $(shell git rev-parse --short HEAD)
release:
	npm install
	docker build -t fps-stats-collector:$(GIT_HASH) .
