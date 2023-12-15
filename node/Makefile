build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/" --ignore-scripts
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes don't relate to dependencies

build-UtilsFunctionLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"

	if [ -d "dist/utils" ]; then cp -R dist/utils/. "$(ARTIFACTS_DIR)/nodejs/utils"; fi
	if [ -d "dist/lambdas" ]; then cp -R dist/lambdas/. "$(ARTIFACTS_DIR)/nodejs/lambdas"; fi
