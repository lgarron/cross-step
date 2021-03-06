.PHONY: build
build: clean-dist
	npx parcel build --public-url ./ src/index.html

.PHONY: dev
dev:
	npx parcel src/index.html

SFTP_PATH = "towns.dreamhost.com:~/garron.net/app/cross-step/"
URL       = "https://garron.net/app/cross-step"

.PHONY: deploy
deploy: build
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/ \
		${SFTP_PATH}
	echo "\nDone deploying. Go to ${URL}\n"


.PHONY: clean
clean: clean-dist

.PHONY: clean-dist
clean-dist:
	rm -rf ./dist
