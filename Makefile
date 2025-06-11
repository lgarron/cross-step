
.PHONE: dev
dev: setup
	bun x vite ./src

.PHONE: build
build: setup
	bun x vite build --emptyOutDir --outDir ../dist/web/garron.net/dance/choreo/dawn-mazurka/ ./src

.PHONE: clean
clean: setup
	rm -rf ./dist ./package-lock.json

.PHONY: reset
reset: clean
	rm -rf ./node_modules

.PHONE: lint
lint: setup
	bun x @biomejs/biome check
	bun x tsc --noEmit --project .

.PHONE: setup
setup:
	bun install --frozen-lockfile

.PHONE: format
format: setup
	bun x @biomejs/biome check --write

.PHOHY: deploy
deploy: setup build
	mkdir -p ./dist/web/garron.net/dance/choreo/dawn-mazurka/video/dash/dawn-mazurka/
	rsync -a ./src/video/dash/dawn-mazurka/ ./dist/web/garron.net/dance/choreo/dawn-mazurka/video/dash/dawn-mazurka/
	bun x @cubing/deploy
