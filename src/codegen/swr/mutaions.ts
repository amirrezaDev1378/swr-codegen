import { Declaration } from "typescript-parser";
import { DocumentNode } from "graphql/language";
import { print } from "graphql/language/printer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import { HookFileType, SaveHookFile } from "./";

const mutationsHookTemplate = fs.readFileSync(path.join(__dirname, "../../templates/swrMutationHook.ejs")).toString();

interface createMutationOptions {
	queryName: string;
	queryVariables: string;
	responseType: string;
	query: string;
}

export const createMutationHook = (
	queryHookTemplate: string,
	{ queryVariables, query, queryName, responseType }: createMutationOptions
) => {
	return ejs.render(queryHookTemplate, {
		queryVariables: queryVariables.trim(),
		query,
		queryName,
		responseType,
	});
};

const createAndSaveMutations = async (
	mutations: Declaration[],
	ownGql: string,
	parsedGql: DocumentNode,
	targetPath: string,
	queryVariables: Declaration[]
) => {
	const generatedHooks = [];
	for (const query of mutations) {
		const hasQueryVariables = queryVariables.find((e) => e.name === query.name + "Variables");
		const mutationName = query.name.replace("Mutation", "").trim();
		const activeQuery = parsedGql.definitions.find((e) => {
			if ("name" in e && e.name) {
				return e.name.value.toLowerCase() === mutationName.toLowerCase();
			}
		}) as any;
		if (!activeQuery) throw new Error("Internal Error Active query is undefined");

		const createdQuery = createMutationHook(mutationsHookTemplate, {
			queryName: mutationName,
			queryVariables: hasQueryVariables ? hasQueryVariables.name : "never",
			responseType: `${query.name.trim()}`,
			query: print(activeQuery),
		});
		const fileInfo: HookFileType = {
			filename: path.join(targetPath, `/hooks/${mutationName}.ts`),
			content: createdQuery,
		};
		generatedHooks.push({ name: mutationName, content: createdQuery });
		// await SaveFile(fileInfo);
	}
	const queryFileTemplate = fs.readFileSync(path.join(__dirname, "../../templates/swrMutationFile.ejs")).toString();

	const typesImport = [...mutations, ...queryVariables].map((t) => t.name).join(",");

	const queryFileContent = ejs.render(queryFileTemplate, {
		hooks: generatedHooks,
		imports: `
import fetcher from "../../utils/swrFetcher"
import {
        Query ,
     ${typesImport}
} from "../../types/graphql.generated"
	`,
	});
	const queryFile: HookFileType = {
		filename: path.join(targetPath, `/hooks/mutations/${path.basename(ownGql)}.hooks.ts`),
		content: queryFileContent,
	};
	await SaveHookFile(queryFile);
};
export default createAndSaveMutations;
