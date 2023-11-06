import { Declaration } from "typescript-parser";
import { DocumentNode } from "graphql/language";
import { print } from "graphql/language/printer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import { HookFileType, SaveHookFile } from "./";

const queryHook = fs.readFileSync(path.join(__dirname, "../../templates/swrQueryHook.ejs")).toString();

interface createQueryOptions {
	queryName: string;
	queryVariables: string;
	responseType: string;
	query: string;
}

const createQueryHook = (
	queryHookTemplate: string,
	{ queryVariables, query, queryName, responseType }: createQueryOptions
) => {
	return ejs.render(queryHookTemplate, {
		queryVariables: queryVariables.trim(),
		query,
		queryName,
		responseType,
	});
};

const createAndSaveQueries = async (
	queries: Declaration[],
	ownGql: string,
	parsedGql: DocumentNode,
	targetPath: string,
	queryVariables: Declaration[]
) => {
	const generatedHooks: any[] = [];
	for (const query of queries) {
		const hasQueryVariables = queryVariables.find((e) => e.name === query.name + "Variables");
		const queryName = query.name.replace("Query", "").trim();
		const activeQuery = parsedGql.definitions.find((e) => {
			if ("name" in e && e.name) {
				return e.name.value.toLowerCase() === queryName.toLowerCase();
			}
		}) as any;
		if (!activeQuery) return console.info("Info , No Query found for", queryName);

		const createdQuery = createQueryHook(queryHook, {
			queryName,
			queryVariables: hasQueryVariables ? hasQueryVariables.name : "never",
			responseType: `${query.name.trim()}`,
			query: print(activeQuery),
		});
		const fileInfo: HookFileType = {
			filename: path.join(targetPath, `/hooks/queries/${queryName}.ts`),
			content: createdQuery,
		};
		generatedHooks.push({ name: queryName, content: createdQuery });
		// await SaveFile(fileInfo);
	}
	const queryFileTemplate = fs.readFileSync(path.join(__dirname, "../../templates/swrQueryFile.ejs")).toString();

	const typesImport = [...queries, ...queryVariables].map((t) => t.name).join(",");

	if (!generatedHooks.length) return console.info("Info , No hooks for queries generated");

	const queryFileContent = ejs.render(queryFileTemplate, {
		hooks: generatedHooks,
		imports: `
import fetcher from "../../utils/swrFetcher"
import {
        Query ,
     ${typesImport}
} from "../../graphql.generated"
	`,
	});
	const queryFile: HookFileType = {
		filename: path.join(targetPath, `/hooks/queries/${path.basename(ownGql)}.hooks.ts`),
		content: queryFileContent,
	};
	await SaveHookFile(queryFile);
};
export default createAndSaveQueries;
