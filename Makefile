
.PHONE: dev
dev:
	bun x vite ./src

.PHONE: build
build:
	bun x vite build --emptyOutDir --outDir ../dist/web/garron.net/app/cross-step/ ./src

.PHONE: clean
clean:
	rm -rf ./dist ./package-lock.json

.PHONE: lint
lint:
	bun x @biomejs/biome

.PHONE: setup
setup:
	bun install --frozen-lockfile

.PHONE: format
format:
	bun x @biomejs/biome format --write ./src

.PHOHY: deploy
deploy: build
	bun x @cubing/deploy
