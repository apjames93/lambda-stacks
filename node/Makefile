build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/" --ignore-scripts
	rm "$(ARTIFACTS_DIR)/nodejs/package.json"

build-UtilsFunctionLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs" "$(ARTIFACTS_DIR)/nodejs/utils" "$(ARTIFACTS_DIR)/nodejs/lambdas"

	if [ -d "utils" ]; then cp -R utils/. "$(ARTIFACTS_DIR)/nodejs/utils/"; fi
	if [ -d "lambdas" ]; then cp -R lambdas/. "$(ARTIFACTS_DIR)/nodejs/lambdas/"; fi
