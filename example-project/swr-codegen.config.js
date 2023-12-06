const fs = require("fs");
/**
 * Module exports.
 * @type {import("../src/types/options").SWRCodegenOptions}
 */
module.exports = {
	gqlGlob: "**/*.gql",
	targetPath: "/generated/swr/",
	schema: "https://graphqlzero.almansi.me/api",
	gatewayAddress: "https://graphqlzero.almansi.me/api",
};

/*
Example Configs
 */

// Using function to retrieve schema
// module.exports = {
// 	gqlGlob: "**/*.gql",
// 	targetPath: "/generated/swr/",
// 	schema: ()=> fs.readFileSync("./schema.json", "utf8"),
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
