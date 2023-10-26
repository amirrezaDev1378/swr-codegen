import { SWRCodegenOptions } from "../types/options";
import GraphqlCodegen from "./graphql";
import globby from "globby";
import SwrGenerator from "../codegen/swr";
import { writeFileSync } from "fs";

interface CodegenOptions {
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

const CodeGenerator = async ({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath }: CodegenOptions) => {
	const { codegenFileOutput } = await GraphqlCodegen({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath });
	if (!codegenFileOutput) throw new Error("No codegen file outputs");

	const gqlPaths = globby.sync(gqlGlob, { cwd: process.cwd(), absolute: true });
	for (const gqlPath of gqlPaths) {
		await SwrGenerator(codegenFileOutput as string, gqlPath, targetPath as string);
	}
};
export default CodeGenerator;
