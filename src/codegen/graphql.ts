import createLocalSchema from "../utils/getSchema";
import globby from "globby";
import path from "path";
import fs from "fs";
import { SWRCodegenOptions } from "../types/options";
import { Types } from "@graphql-codegen/plugin-helpers";
import getFetcher from "../utils/getFetcher";
import ejs from "ejs";
import { exec } from "child_process";
import * as util from "util";

interface GraphqlCodegenOptions {
	targetPath:
		| string
		| {
				types: string;
		  };
	schema: SWRCodegenOptions["schema"];
	gqlGlob: string;
	customFetcher?: string;
	rawTargetPath: string;
}

const WriteFile = async (file: Types.FileOutput) => {
	fs.mkdirSync(path.join(path.dirname(file.filename)), { recursive: true });
	fs.writeFileSync(path.join(file.filename), file.content, { flag: "w+" });
};
const createTempConfig = async ({ schemaPath, gqlFiles, typesPath }: any) => {
	const template = ejs.render(fs.readFileSync(path.join(__dirname, "../templates/gqlConfig.ejs")).toString(), {
		schemaPath: schemaPath.replaceAll("\\", "/"),
		gqlFiles: JSON.stringify(gqlFiles.map((i) => path.join(process.cwd(), i).replaceAll("\\", "/"))),
		typesPath: typesPath.replaceAll("\\", "/"),
	});
	console.log(path.join(__dirname, "../templates/gqlConfig.ejs"));
	await WriteFile({
		filename: path.join(__dirname, "../../", "temp/config.ts"),
		content: template,
	});
};
const GraphqlCodegen = async ({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath }: GraphqlCodegenOptions) => {
	const typesPath: string = typeof targetPath === "string" ? targetPath : targetPath.types;

	await createLocalSchema(schema);
	const gqlFiles = await globby(gqlGlob, { cwd: process.cwd(), absolute: false });
	if (!gqlFiles.length) {
		throw new Error(`No files found for glob ${gqlGlob}`);
	}
	const fetcher = await getFetcher(`${targetPath}/utils`, "axios", customFetcher);
	await createTempConfig({
		schemaPath: path.join(__dirname, "../../", "temp/schema.graphql"),
		gqlFiles,
		typesPath: path.join(__dirname, "../../", "temp/types"),
		// typesPath: path.normalize(typesPath).split(path.sep).join("/")
	});
	const promisedExec = util.promisify(exec);
	const command = await promisedExec("graphql-codegen  --config temp/config.ts", {
		cwd: path.join(__dirname, "../../"),
	}).catch((error) => {
		if (error) {
			console.error(error);
		}
		return { stdout: error };
	});

	const graphqlFile = fs.readFileSync(path.join(__dirname, "../../", "temp/types/graphql.ts"));
	await WriteFile({
		filename: path.join(typesPath, "graphql.generated.ts"),
		content: graphqlFile.toString(),
	});
	return { codegenFileOutput: graphqlFile.toString() };
};
export default GraphqlCodegen;
