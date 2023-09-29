import getSchema from "../utils/getSchema";
import globby from "globby";
import path from "path";
import fs from "fs";
import * as gqlCodegen from "@graphql-codegen/cli";
import { SWRCodegenOptions } from "../types/options";
import { Types } from "@graphql-codegen/plugin-helpers";
import getFetcher from "../utils/getFetcher";

interface GraphqlCodegenOptions {
	targetPath:
		| string
		| {
				types: string;
		  };
	schema: SWRCodegenOptions["schema"];
	gqlGlob: string;
	customFetcher?: string;
}

const WriteTypeFile = async (file: Types.FileOutput) => {
	fs.mkdirSync(path.join(process.cwd(), path.dirname(file.filename)), { recursive: true });
	fs.writeFileSync(path.join(process.cwd(), file.filename), file.content, { flag: "w+" });
};

const GraphqlCodegen = async ({ customFetcher, schema, gqlGlob, targetPath }: GraphqlCodegenOptions) => {
	const typesPath: string = typeof targetPath === "string" ? targetPath : targetPath.types;
	const parsedSchema = await getSchema(schema);
	const gqlFiles = await globby(gqlGlob, { cwd: process.cwd(), absolute: true });
	console.log(gqlFiles);
	if (!gqlFiles.length) {
		throw new Error(`No files found for glob ${gqlGlob}`);
	}
	const fetcher = await getFetcher(`${targetPath}/utils`, "axios", customFetcher);

	const codegenConfig: gqlCodegen.CodegenConfig = {
		overwrite: true,
		schema: path.join(process.cwd(), "temp/schema.graphql"),
		documents: gqlFiles,
		generates: {
			[typesPath]: {
				preset: "client",
				plugins: [],
				// plugins: ["typescript", "typescript-operations"],
			},
		},
		hooks: {
			afterAllFileWrite: ["prettier --write"],
		},
	};

	const codegenFileOutputs = await gqlCodegen.executeCodegen({ ...codegenConfig, cwd: process.cwd() });
	const graphqlFile = codegenFileOutputs.find((f) => f.filename.includes("graphql."));
	if (!graphqlFile) throw new Error("Failed to obtain generated ts types!");
	await WriteTypeFile({ ...graphqlFile, filename: path.join(targetPath as string, "types/graphql.generated.ts") });

	return { codegenFileOutputs };
};
export default GraphqlCodegen;
