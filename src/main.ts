#!/usr/bin/env node

import GetOptions from "./utils/getOptions";
import CodeGenerator from "./codegen";
import GetCliOptions from "./cli/commander";
import InitCommand from "./cli/commands/init";

const main = async () => {
	const { configPath, init } = GetCliOptions();
	if (init) {
		return await InitCommand();
	}

	const { targetPath, gqlGlob, schema, customFetcher, rawTargetPath } = await new GetOptions({
		configPath,
	}).getOptions();
	await CodeGenerator({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath });
};

main();
