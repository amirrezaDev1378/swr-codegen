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
	const generatedHooks: any[] = [];
	for (const query of mutations) {
		const hasQueryVariables = queryVariables.find((e) => e.name === query.name + "Variables");
		const mutationName = query.name.replace("Mutation", "").trim();
		const activeQuery = parsedGql.definitions.find((e) => {
			if ("name" in e && e.name) {
				return e.name.value.toLowerCase() === mutationName.toLowerCase();
			}
		}) as any;
		if (!activeQuery) {
			console.info("Info , No Mutation found for", mutationName);
			continue;
		}
		const createdQuery = createMutationHook(mutationsHookTemplate, {
			queryName: mutationName,
			queryVariables: hasQueryVariables ? hasQueryVariables.name : "never",
			responseType: `${query.name.trim()}`,
			query: print(activeQuery),
		});
		const fileInfo = {
			name: path.join(targetPath, `/hooks/${mutationName}.ts`),
			content: createdQuery,
		};
		generatedHooks.push(fileInfo);
		// await SaveFile(fileInfo);
	}

	if (!generatedHooks.length) return console.info("Info , No hooks for mutations generated");

	const mutationFileTemplate = fs.readFileSync(path.join(__dirname, "../../templates/swrMutationFile.ejs")).toString();

	const typesImport = [...mutations, ...queryVariables].map((t) => t.name).join(",");

	const queryFileContent = ejs.render(mutationFileTemplate, {
		hooks: generatedHooks,
		imports: `
import fetcher from "../../utils/swrFetcher"
import {
        Query ,
     ${typesImport}
} from "../../graphql.generated"
	`,
	});
	const mutationFile: HookFileType = {
		filename: path.join(targetPath, `/hooks/mutations/${path.basename(ownGql)}.hooks.ts`),
		content: queryFileContent,
	};
	await SaveHookFile(mutationFile);
};
export default createAndSaveMutations;
