import { GraphQLSchema, printSchema } from "graphql";

export function getSDL(schema: GraphQLSchema | null | undefined) {
	if (schema instanceof GraphQLSchema) {
		return printSchema(schema);
	}
	return "";
}
