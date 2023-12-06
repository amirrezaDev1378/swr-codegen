import { GraphQLSchema, printSchema } from "graphql";
import { isValidJson } from "./helpers";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";

export function getSDL(schema: GraphQLSchema | null | undefined) {
	if (schema instanceof GraphQLSchema) {
		return printSchema(schema);
	}
	return "";
}

export const parseJsonSchema = (target: string) => {
	const isSchemaJson = isValidJson(target);
	if (!isSchemaJson) throw new Error("Internal Error: Invalid schema ...");

	const jsonSchema = JSON.parse(target);
	const schemaObject = jsonSchema?.data || jsonSchema;

	if (Object.keys(schemaObject).length === 0) throw new Error("Error: Invalid Json Schema ...");

	try {
		const clientSchema = buildClientSchema(schemaObject, { assumeValid: true });
		const SDL = getSDL(clientSchema);
		return { SDL, clientSchema };
	} catch (e) {
		console.error(e);
		throw new Error("Failed to build schema from json");
	}
};

export const introspectionQuery = `
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type {
    ...TypeRef
  }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}

`;
