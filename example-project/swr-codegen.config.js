const fs = require("fs");

module.exports = {
	gqlGlob: "**/*.gql",
	targetPath: "/generated/swr/",
	schema: "https://graphqlzero.almansi.me/api",
	gatewayAddress: "https://graphqlzero.almansi.me/api",
};

/*
Example Configs
 */

// Using function to retrive schema
// module.exports = {
// 	gqlGlob: "**/*.gql",
// 	targetPath: "/generated/swr/",
// 	schema: ()=> fs.readFileSync("./schema.graphql", "utf8"),
// 	gatewayAddress: "https://graphqlzero.almansi.me/api",
// };

// Using SDL schema path
// module.exports = {
// 	gqlGlob: "**/*.gql",
// 	targetPath: "/generated/swr/",
// 	schema: "./schema.graphql",
// 	gatewayAddress: "https://graphqlzero.almansi.me/api",
// };

// Using JSON schema path
// module.exports = {
// 	gqlGlob: "**/*.gql",
// 	targetPath: "/generated/swr/",
// 	schema: "./schema.json",
// 	gatewayAddress: "https://graphqlzero.almansi.me/api",
// };
