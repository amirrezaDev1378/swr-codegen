import { TypescriptParser } from "typescript-parser";
import gqlParser from "graphql-tag";
import fs from "fs";
import createAndSaveQueries from "./queries";
import path from "path";

export interface HookFileType {
	filename: string;
	content: string;
}

export const SaveHookFile = async (file: HookFileType) => {
	fs.mkdirSync(path.join(process.cwd(), path.dirname(file.filename)), { recursive: true });
	fs.writeFileSync(path.join(process.cwd(), file.filename), file.content, { flag: "w+" });
};
const SwrGenerator = async (typesSource: string, ownGql: string, targetPath: string) => {
	if (!typesSource || !ownGql) throw new Error("No types source or own gql file found");
	const parser = new TypescriptParser();
	const { declarations } = await parser.parseSource(typesSource);
	const queries = declarations.filter((e) => e.name.endsWith("Query") && e.name !== "Query");
	const queryVariables = declarations.filter((e) => e.name.endsWith("Variables"));

	const fragments = declarations.filter((e) => e.name.endsWith("Fragment"));
	const mutation = declarations.filter((e) => e.name.endsWith("Mutation"));

	const gqlFile = fs.readFileSync(ownGql).toString();
	const parsedGql = gqlParser(gqlFile);
	await createAndSaveQueries(queries, ownGql, parsedGql, targetPath, queryVariables);
};
export default SwrGenerator;
