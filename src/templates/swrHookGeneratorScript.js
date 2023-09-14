let ejs = require("ejs");
const fs = require("fs-extra");
const glob = require("glob");

const graphqlDir = "../apps/nahartime-admin/src/graphQl";
const swrDir = "../apps/nahartime-admin/src/graphQl/swr";
const typesDir = "../../types/generatedTypes";
const queryTemplatePath = "./swrQueryTemplate.ejs";
const mutationTemplatePath = "./swrMutationTemplate.ejs";
const fetcherPath = "../fetcher/fetcher";

// Find all .gql files in the graphqlDir
const gqlFiles = glob.sync(`${graphqlDir}/**/*.gql`);
// Create the SWR directory if it doesn't exist
fs.ensureDirSync(swrDir);

let concatenatedTemplates = "";
gqlFiles.forEach((gqlFile) => {
	const gqlContent = fs.readFileSync(gqlFile, "utf-8");
	const queries = gqlContent.split("#---");

	const types = [];
	const hooks = [];
	let swrRequestCode = null;
	let queryName = null;
	queries.forEach((query) => {
		// Remove leading and trailing whitespace
		const trimmedQuery = query.trim();
		const isQuery = trimmedQuery.startsWith("query");

		if (trimmedQuery) {
			// Extract the query name from the GraphQL document
			let match = "";
			if (isQuery) {
				match = trimmedQuery.match(/^query\s+(\w+)/);
			} else {
				match = trimmedQuery.match(/^mutation\s+(\w+)/);
			}

			if (match && match[1]) {
				queryName = match[1];
				// const filterType = trimmedQuery.match(/\$filter:\s+(\w+)/);
				let variableType = "";
				let responseType = "";
				if (isQuery) {
					variableType = queryName + "QueryVariables";
					responseType = queryName + "Query";
				} else {
					variableType = queryName + "MutationVariables";
					responseType = queryName + "Mutation";
				}

				types.push(responseType, variableType);

				// Compile the EJS template with the modified GraphQL document
				swrRequestCode = ejs.render(fs.readFileSync(isQuery ? queryTemplatePath : mutationTemplatePath, "utf-8"), {
					queryName: isQuery ? queryName + "Query" : queryName + "Mutation",
					query: trimmedQuery,
					variableType: variableType || "any",
					responseType: responseType || "any",
				});
				concatenatedTemplates += swrRequestCode + "\n\n";
			}
		}
	});
	// Write the SWR request file with the queryName as the filename
	//   swrRequestCode = ejs.render(fs.readFileSync(templatePath, 'utf-8'), {
	//     types,
	//   });
	const typesImport = `import { ${types.join(", ")} } from '${typesDir}';\n`;
	const swrImport = `import useSWR from 'swr';\n`;
	const mutationImport = `import useSWRMutation from 'swr/mutation';\n`;
	const fetcherImport = `import { fetcher } from '${fetcherPath}';\n`;
	const concatenatedFile = `${swrDir}/swrHooks.ts`;
	concatenatedTemplates = swrImport + fetcherImport + mutationImport + typesImport + concatenatedTemplates;
	fs.writeFileSync(concatenatedFile, concatenatedTemplates, "utf-8");
});
