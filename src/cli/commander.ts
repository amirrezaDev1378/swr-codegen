import { Command, Option } from "commander";
import * as process from "process";

interface CliOptions {
	init: boolean;
	configPath: string;
}

const GetCliOptions = (): CliOptions => {
	const initOptions = new Option("-i, --init", "init the config file");
	const configPathOptions = new Option("-c, --configPath <path>", "path to config file");

	const program = new Command();

	program.addOption(initOptions).addOption(configPathOptions);

	program.parse(process.argv);

	const options = program.opts();
	console.log(options);

	return {
		init: options.init || false,
		configPath: options.configPath || "",
	};
};
export default GetCliOptions;
