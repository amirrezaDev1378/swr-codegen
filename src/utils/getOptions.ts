import * as fs from "fs";
import * as path from "path";
import { SWRCodegenOptions } from "../types/options";
import { GetOptionalKeys, GetRequiredKeys } from "../utils/utilTypes";

type cliOptionsType = {
	configPath?: string;
};

interface OptionsReturnType extends SWRCodegenOptions {
	rawTargetPath: string;
}

let memoryCachedOptions: OptionsReturnType = null as any as OptionsReturnType;

class GetOptions {
	private readonly configPath: string;
	private requiredOptions: GetRequiredKeys<SWRCodegenOptions>[] = ["gqlGlob", "targetPath", "schema", "gatewayAddress"];
	private optionalOptions: GetOptionalKeys<SWRCodegenOptions>[] = ["customFetcher"];
	private config: SWRCodegenOptions = {} as SWRCodegenOptions;
	static test: string;

	constructor(cliOptions: cliOptionsType) {
		this.configPath = path.join(process.cwd(), cliOptions.configPath || "swr-codegen.config.js");
	}

	public async validateConfig() {
		const doesConfigExist = fs.existsSync(this.configPath);
		if (!doesConfigExist) {
			throw new Error(`Config file ${this.configPath} does not exist`);
		}
		const configObject = await import(this.configPath).then((config) => config.default);
		if (!configObject) {
			throw new Error(`Config file ${this.configPath} does not export a default object`);
		}
		if (typeof configObject !== "object") {
			throw new Error(`Config file ${this.configPath} does not export a config object`);
		}

		this.config = configObject as SWRCodegenOptions;

		if (!this.config) {
			throw new Error(`Config file ${this.configPath} does not return an object`);
		}
		this.requiredOptions.forEach((option) => {
			if (!this.config[option]) {
				throw new Error(`Config file ${this.configPath} does not have required option ${option}`);
			}
		});
	}

	public async getOptions(): Promise<OptionsReturnType> {
		await this.validateConfig();
		memoryCachedOptions = {
			...this.config,
			targetPath: path.join(process.cwd(), this.config.targetPath as string),
			rawTargetPath: this.config.targetPath as string,
		};
		return memoryCachedOptions;
	}
	static getCachedOptions(): OptionsReturnType {
		if (!memoryCachedOptions) {
			throw new Error("Options are not initialized yet");
		}
		return memoryCachedOptions;
	}
}

export default GetOptions;
