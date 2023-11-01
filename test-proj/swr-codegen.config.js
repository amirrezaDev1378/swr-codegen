const fs = require("fs");

module.exports = {
	gqlGlob: "**/*.gql",
	targetPath: "/generated/swr/",
	schema: "schema.graphql",
	gatewayAddress: "http://localhost:4000/graphql",
};
