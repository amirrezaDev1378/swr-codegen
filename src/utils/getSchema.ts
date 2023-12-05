import { SWRCodegenOptions } from "../types/options";
import { GraphQLSchema } from "graphql/type";
import * as fs from "fs";
import path from "path";
import { isValidJson, isValidUrl } from "./helpers";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import { getSDL } from "./SDL";

const saveSchema = (content: GraphQLSchema | string) => {
	const schemaString = content.toString();
	const isSchemaJson = isValidJson(content);
	fs.mkdirSync(path.join(__dirname, "../../", "temp"), { recursive: true });
	if (isSchemaJson) {
		const jsonSchema = JSON.parse(schemaString);
		const schemaObject = jsonSchema?.data || jsonSchema;
		console.info("Info : using json schema");
		try {
			const clientSchema = buildClientSchema(schemaObject, { assumeValid: false });
			const SDL = getSDL(clientSchema);

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
					query: `query IntrospectionQuery {
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
}`,
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
		const isValidSchema = require("graphql").buildSchema(rawSchema);
		if (!isValidSchema) {
			throw new Error("Schema function did not return a valid schema");
		}
		saveSchema(rawSchema);
		return;
	}

	throw new Error("Schema must be a string or a function");
};

export default createLocalSchema;
