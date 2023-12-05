import { SWRCodegenOptions } from "../types/options";
import { GraphQLSchema } from "graphql/type";
import * as fs from "fs";
import path from "path";
import { isValidJson, isValidUrl } from "./helpers";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import { getSDL, introspectionQuery, parseJsonSchema } from "./SDL";

const saveSchema = (content: GraphQLSchema | string) => {
	const schemaString = content.toString();
	const isSchemaJson = isValidJson(content);
	fs.mkdirSync(path.join(__dirname, "../../", "temp"), { recursive: true });
	if (isSchemaJson) {
		console.info("Info : using json schema");
		try {
			const { SDL, clientSchema } = parseJsonSchema(schemaString);
			fs.writeFileSync(path.join(__dirname, "../../", "temp/schema.graphql"), SDL, {
				flag: "w+",
			});
			return clientSchema;
		} catch (e) {
			console.error(e);
			throw new Error("Failed to build schema from json");
		}
	}

	fs.writeFileSync(path.join(__dirname, "../../", "temp/schema.graphql"), schemaString, {
		flag: "w+",
	});
};

const getContent = async (schema: string) => {
	const isSchemaUrl = isValidUrl(schema);
	const exists = fs.existsSync(path.join(process.cwd(), schema));
	if (exists) {
		return fs.readFileSync(path.join(process.cwd(), schema)).toString();
	}

	if (isSchemaUrl) {
		try {
			return await fetch(schema, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: introspectionQuery,
				}),
			}).then((r) => r.text());
		} catch (e) {
			console.error(e);
			throw new Error("Failed to fetch schema from url");
		}
	}
	throw new Error(`Schema ${schema} does not exist`);
};

const createLocalSchema = async (schema: SWRCodegenOptions["schema"]): Promise<void> => {
	if (!schema) {
		throw new Error("Schema not provided");
	}

	if (typeof schema === "string") {
		const schemaString = await getContent(schema);
		try {
			saveSchema(schemaString);
			return;
		} catch (e) {
			console.error("failed to build schema from string");
			throw e;
		}
	}

	if (typeof schema === "function") {
		const rawSchema = await schema();
		if (!rawSchema) {
			throw new Error("Schema function did not return a schema");
		}
		if (isValidJson(rawSchema)) {
			console.log("Info : using json schema");
			const { SDL } = parseJsonSchema(typeof rawSchema === "object" ? JSON.stringify(rawSchema) : rawSchema);
			saveSchema(SDL);
			return;
		}

		const isValidSchema = require("graphql").buildSchema(rawSchema);
		if (!isValidSchema) {
			throw new Error("Schema function did not return a valid schema");
		}
		saveSchema(rawSchema as GraphQLSchema);
		return;
	}

	throw new Error("Schema must be a string or a function");
};

export default createLocalSchema;
