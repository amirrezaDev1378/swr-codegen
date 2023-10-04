import extractArgs from "./utils/args";
import GetOptions from "./utils/getOptions";
import CodeGenerator from "./codegen";

const main = async () => {
	const args = extractArgs();
	const { configPath } = args || {};
	const { targetPath, gqlGlob, schema, customFetcher, rawTargetPath } = await new GetOptions({
		configPath,
	}).getOptions();
	await CodeGenerator({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath });
};

main();
