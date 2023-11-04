#!/usr/bin/env node

import GetOptions from "./utils/getOptions";
import CodeGenerator from "./codegen";
import GetCliOptions from "./cli/commander";
import InitCommand from "./cli/commands/init";
import removeTempFiles from "./utils/removeTempFiles";

const main = async () => {
	const { configPath, init } = GetCliOptions();
	if (init) {
		return await InitCommand();
	}

	const { targetPath, gqlGlob, schema, customFetcher, rawTargetPath } = await new GetOptions({
		configPath,
	}).getOptions();
	await CodeGenerator({
		customFetcher,
		schema,
		gqlGlob: `{,!(node_modules)/**/}${gqlGlob}`,
		targetPath,
		rawTargetPath,
	});

	removeTempFiles();
};

main();
