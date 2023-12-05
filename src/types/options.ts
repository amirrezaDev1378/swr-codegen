import { GraphQLSchema } from "graphql/type";

type schemaFetcher = () => Promise<GraphQLSchema | Object | string>;

export interface SWRCodegenOptions {
	/*
	 **  The path to the directory where the generated files will be written.
	 */
	targetPath:
		| string
		| {
				hooks: string;
				types: string;
		  };

	/*
	 **  The path to the schema file or a function that returns a promise that resolves to a GraphQLSchema.
	 */
	schema: string | schemaFetcher;

	gatewayAddress: string;

	/*
	 **  The path to the directory where the GraphQL documents are located.
	 **  example: "/graphQl/*.gql
	 **/
	gqlGlob: string;

	/**
	 * A custom fetcher path
	 */
	customFetcher?: string;
}
