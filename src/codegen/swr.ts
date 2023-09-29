import { TypescriptParser } from "typescript-parser";
import gqlParser from "graphql-tag";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { print } from "graphql/language/printer";

interface createQueryOptions {
	queryName: string;
	queryType: string;
	responseType: string;
	query: string;
}

const templates = {
	queryHook: fs.readFileSync(path.join(__dirname, "../templates/swrQueryHook.ejs")).toString(),
};

interface FileType {
	filename: string;
	content: string;
}

const SaveFile = async (file: FileType) => {
	fs.mkdirSync(path.join(process.cwd(), path.dirname(file.filename)), { recursive: true });
	fs.writeFileSync(path.join(process.cwd(), file.filename), file.content, { flag: "w+" });
};

const createQueryHook = ({ queryType, query, queryName, responseType }: createQueryOptions) => {
	const hook = ejs.render(templates.queryHook, {
		queryType,
		query,
		queryName,
		responseType,
	});
	console.log(hook);
	return hook;
};

const SwrGenerator = async (typesSource: string, ownGql: string, targetPath: string) => {
	if (!typesSource || !ownGql) throw new Error("No types source or own gql file found");
	const parser = new TypescriptParser();
	const { declarations } = await parser.parseSource(typesSource);
	const queries = declarations.filter((e) => e.name.endsWith("Query") && e.name !== "Query");
	const fragments = declarations.filter((e) => e.name.endsWith("Fragment"));
	const mutation = declarations.filter((e) => e.name.endsWith("Mutation"));

	const gqlFile = fs.readFileSync(ownGql).toString();
	const parsedGql = gqlParser(gqlFile);

	const generatedHooks = [];
	for (const query of queries) {
		const queryName = query.name.replace("Query", "").trim();
		const activeQuery = parsedGql.definitions.find((e) => {
			if ("name" in e && e.name) {
				return e.name.value.toLowerCase() === queryName.toLowerCase();
			}
		}) as any;
		if (!activeQuery) throw new Error("Internal Error Active query is undefined");
		const createdQuery = createQueryHook({
			queryName,
			queryType: query.name.trim(),
			responseType: `Query\[\"${query.name.trim()}\"\]`,
			query: print(activeQuery),
		});
		const fileInfo: FileType = {
			filename: path.join(targetPath, `/hooks/${queryName}.ts`),
			content: createdQuery,
		};
		generatedHooks.push({ name: queryName, content: createdQuery });
		// await SaveFile(fileInfo);
	}
	const queryFileTemplate = fs.readFileSync(path.join(__dirname, "../templates/swrQueryFile.ejs")).toString();
	const queryFileContent = ejs.render(queryFileTemplate, {
		hooks: generatedHooks,
		imports: `
	import {Query , ${queries.map((q) => q.name).join(",")}} from "../types/graphql.generated"
	
	`,
	});
	const queryFile: FileType = {
		filename: path.join(targetPath, `/hooks/${path.basename(ownGql)}.hooks.ts`),
		content: queryFileContent,
	};
	await SaveFile(queryFile);
};
export default SwrGenerator;
