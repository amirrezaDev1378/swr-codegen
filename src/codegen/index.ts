import { SWRCodegenOptions } from "../types/options";
import GraphqlCodegen from "./graphql";
import globby from "globby";
import SwrGenerator from "../codegen/swr";

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
	const { codegenFileOutputs } = await GraphqlCodegen({ customFetcher, schema, gqlGlob, targetPath, rawTargetPath });
	if (!codegenFileOutputs.length) throw new Error("No codegen file outputs");
	const types = codegenFileOutputs.find((c) => c.filename.includes("graphql.ts"))?.content;
	const gqlPaths = globby.sync(gqlGlob, { cwd: process.cwd(), absolute: true });
	for (const gqlPath of gqlPaths) {
		await SwrGenerator(types as string, gqlPath, targetPath as string);
	}
};
export default CodeGenerator;
