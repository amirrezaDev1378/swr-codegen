import { SWRCodegenOptions } from "../types/options";
import { GraphQLSchema } from "graphql/type";
import * as fs from "fs";
import path from "path";

const saveSchema = (content: GraphQLSchema | string) => {
	const schemaString = content.toString();

	fs.mkdirSync(path.join(process.cwd(), "temp"), { recursive: true });

	fs.writeFileSync(path.join(process.cwd(), "temp/schema.graphql"), schemaString, {
		flag: "w+",
	});
};

const createLocalSchema = async (schema: SWRCodegenOptions["schema"]): Promise<GraphQLSchema> => {
	if (!schema) {
		throw new Error("Schema not provided");
	}

	if (typeof schema === "string") {
		const exists = fs.existsSync(path.join(process.cwd(), schema));
		if (!exists) throw new Error(`Schema file ${schema} does not exist`);
		const schemaString = fs.readFileSync(path.join(process.cwd(), schema)).toString();
		try {
			saveSchema(schemaString);
			return require("graphql").buildSchema(schemaString);
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
		const isValidSchema = require("graphql").buildSchema(rawSchema);
		if (!isValidSchema) {
			throw new Error("Schema function did not return a valid schema");
		}
		saveSchema(rawSchema);
		return rawSchema;
	}

	throw new Error("Schema must be a string or a function");
};

export default createLocalSchema;
