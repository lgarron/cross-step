
.PHONE: dev
dev: setup
	bun x vite ./src

.PHONE: build
build: setup
	bun x vite build --emptyOutDir --outDir ../dist/web/garron.net/app/cross-step/ ./src

.PHONE: clean
clean: setup
	rm -rf ./dist ./package-lock.json

.PHONE: lint
lint: setup
	bun x @biomejs/biome

.PHONE: setup
setup:
	bun install --frozen-lockfile

.PHONE: format
format: setup
	bun x @biomejs/biome format --write ./src

.PHOHY: deploy
deploy: setup build
	bun x @cubing/deploy
